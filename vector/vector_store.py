"""
Vector Store for PostgreSQL / pgvector Semantic Academic Knowledge Retrieval.
Stores institutional policies, remediation rules, and counseling protocols
in a dedicated 'academic_knowledge_vector' table without modifying the 16 relational tables.
"""

import os
import json
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from vector.embedding_service import get_embedding_service, VECTOR_DIMENSION

logger = logging.getLogger("VectorStore")

# Seed Documents: Authentic institutional academic policies
INSTITUTIONAL_KNOWLEDGE_DOCUMENTS = [
    {
        "doc_key": "POL-ATT-001",
        "title": "Academic Attendance Regulation & Condonation Policy (Article 7.1)",
        "category": "ATTENDANCE",
        "content": "A minimum of 75% lecture attendance is mandatory across all enrolled subjects to appear for end-semester examinations. Students with attendance between 65% and 74.9% may apply for Dean Condonation on verified medical grounds. Students falling below 65% attendance at Week 8 milestone are placed under academic attendance monitoring with mandatory parent notification and daily sign-in.",
        "tags": ["attendance", "condonation", "medical", "75%", "detention", "week8"],
        "provenance": "DEMONSTRATION / SYNTHETIC KNOWLEDGE — EduInsight Institutional Academic Regulations"
    },
    {
        "doc_key": "POL-ASS-002",
        "title": "Continuous Internal Assessment & Mid-Term Remediation Guidelines (Article 12.3)",
        "category": "ASSESSMENT_REMEDIATION",
        "content": "Continuous Internal Assessment comprises Mid-1 (40%), Mid-2 (40%), and Quizzes/Assignments (20%). If a student scores below 50% in Mid-1 Assessment, the department must mandate subject-level remedial tutorials and offer a structured makeup improvement quiz before the Mid-2 examination milestone at Week 8.",
        "tags": ["midterm", "internal marks", "mid1", "mid2", "remedial", "quiz", "makeup"],
        "provenance": "DEMONSTRATION / SYNTHETIC KNOWLEDGE — EduInsight Examination Cell Manual"
    },
    {
        "doc_key": "POL-PROB-003",
        "title": "Academic Standing, Backlog Recovery & Probation Rules (Article 15.2)",
        "category": "ACADEMIC_PROBATION",
        "content": "A student whose semester SGPA falls below 6.00 or who accumulates 2 or more historical subject backlogs is placed on Academic Probation Tier-1. The student is paired with a designated faculty mentor and assigned an individualized backlog clearance schedule limiting extra-curricular hours.",
        "tags": ["sgpa", "cgpa", "backlogs", "probation", "arrears", "mentoring"],
        "provenance": "DEMONSTRATION / SYNTHETIC KNOWLEDGE — Academic Advisory Council Guidelines"
    },
    {
        "doc_key": "POL-MENT-004",
        "title": "Prescriptive Faculty Mentoring & Weekly Triage Protocol (Article 4.8)",
        "category": "MENTORING",
        "content": "Faculty mentors must conduct bi-weekly 1-on-1 counseling for all students classified as High Risk at the Week 4 and Week 8 temporal checkpoints. The mentor must review continuous assessment scores, identify conceptual roadblocks, and record progress notes in the EduInsight decision log.",
        "tags": ["mentoring", "counseling", "faculty", "triage", "high risk", "week4", "week8"],
        "provenance": "DEMONSTRATION / SYNTHETIC KNOWLEDGE — Faculty Mentor Handbook"
    },
    {
        "doc_key": "POL-LAB-005",
        "title": "Practical Laboratory Completion & Experiment Deficit Protocol (Article 9.4)",
        "category": "LAB_PRACTICAL",
        "content": "Students must complete at least 80% of scheduled practical laboratory experiments and submit verified lab records by Week 12. Students with lagging lab scores are eligible for supervised Saturday makeup lab sessions to prevent end-semester practical examination debarment.",
        "tags": ["laboratory", "practical", "experiments", "viva", "record", "week12"],
        "provenance": "DEMONSTRATION / SYNTHETIC KNOWLEDGE — Engineering Lab Manual"
    }
]

class VectorStore:
    def __init__(self):
        self.embedding_service = get_embedding_service()
        self.documents: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        self._init_in_memory_store()
        self._try_init_postgres_pgvector()

    def _init_in_memory_store(self):
        """Initializes in-memory vector index with authentic policy embeddings."""
        self.documents = list(INSTITUTIONAL_KNOWLEDGE_DOCUMENTS)
        corpus_texts = [f"{d['title']} {d['content']} {' '.join(d['tags'])}" for d in self.documents]
        self.embeddings = self.embedding_service.encode(corpus_texts)
        for i, d in enumerate(self.documents):
            d["embedding"] = self.embeddings[i].tolist()
        logger.info(f"Initialized in-memory vector store with {len(self.documents)} institutional documents.")

    def _try_init_postgres_pgvector(self):
        """
        Attempts to create and sync the academic_knowledge_vector table in PostgreSQL
        if pgvector extension and connection are available.
        """
        try:
            import psycopg2
            conn_url = os.getenv(
                "DATABASE_URL",
                "postgresql://postgres:12345@localhost:5432/EduInsight"
            )
            conn = psycopg2.connect(conn_url)
            cur = conn.cursor()
            
            # 1. Ensure dedicated table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS academic_knowledge_vector (
                    id SERIAL PRIMARY KEY,
                    doc_key VARCHAR(100) UNIQUE NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    content TEXT NOT NULL,
                    tags TEXT[] NOT NULL,
                    provenance VARCHAR(255) NOT NULL,
                    embedding FLOAT8[] NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # 2. Insert or update seed policies
            for doc in self.documents:
                cur.execute("""
                    INSERT INTO academic_knowledge_vector (doc_key, title, category, content, tags, provenance, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (doc_key) DO UPDATE SET
                        title = EXCLUDED.title,
                        content = EXCLUDED.content,
                        tags = EXCLUDED.tags,
                        embedding = EXCLUDED.embedding;
                """, (
                    doc["doc_key"],
                    doc["title"],
                    doc["category"],
                    doc["content"],
                    doc["tags"],
                    doc["provenance"],
                    doc["embedding"]
                ))
                
            conn.commit()
            cur.close()
            conn.close()
            logger.info("Synchronized PostgreSQL academic_knowledge_vector table successfully.")
        except Exception as e:
            logger.warning(f"PostgreSQL pgvector sync skipped/running in-memory fallback: {e}")

    def search_similar_policies(self, query: str, top_k: int = 2, min_score: float = 0.20) -> List[Dict[str, Any]]:
        """
        Performs semantic vector search using cosine similarity against stored institutional policies.
        """
        if not query or self.embeddings is None:
            return []

        query_vec = self.embedding_service.encode(query)
        
        # Cosine similarity: dot product of L2-normalized vectors
        scores = np.dot(self.embeddings, query_vec)
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score >= min_score:
                doc = self.documents[idx]
                results.append({
                    "doc_key": doc["doc_key"],
                    "title": doc["title"],
                    "category": doc["category"],
                    "content": doc["content"],
                    "relevance_score": round(score, 4),
                    "tags": doc["tags"],
                    "provenance": doc["provenance"]
                })
                
        return results

    def get_all_policies(self) -> List[Dict[str, Any]]:
        return [
            {
                "doc_key": d["doc_key"],
                "title": d["title"],
                "category": d["category"],
                "content": d["content"],
                "tags": d["tags"],
                "provenance": d["provenance"]
            }
            for d in self.documents
        ]


_vector_store_instance = None

def get_vector_store() -> VectorStore:
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = VectorStore()
    return _vector_store_instance
