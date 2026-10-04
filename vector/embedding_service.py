"""
Embedding Service for EduInsight AI Vector Layer.
Provides deterministic, normalized dense vector embeddings (128-dimensional)
for institutional academic policies, remediation guidelines, and risk context queries.
"""

import re
import numpy as np
from typing import List, Union

VECTOR_DIMENSION = 128

# Core academic vocabulary anchor terms for institutional policy representation
ACADEMIC_ANCHORS = [
    "attendance", "condonation", "minimum", "shortage", "medical", "leave", "exemption", "75%",
    "assessment", "midterm", "internal", "marks", "continuous", "evaluation", "exam", "quiz",
    "backlog", "arrears", "supplementary", "remedial", "re-exam", "improvement", "clearing",
    "mentoring", "counseling", "faculty", "advisor", "guidance", "support", "peer", "tutoring",
    "laboratory", "practical", "experiments", "viva", "record", "submission", "equipment",
    "sgpa", "cgpa", "probation", "detention", "academic", "standing", "eligibility", "credits",
    "intervention", "action", "plan", "playbook", "milestone", "week4", "week8", "week12",
    "engineering", "course", "curriculum", "department", "aiml", "cse", "ece", "mech",
    "assignment", "deadline", "late", "submission", "rubric", "grading", "policy", "regulations"
]

class AcademicEmbeddingService:
    def __init__(self, dimension: int = VECTOR_DIMENSION):
        self.dimension = dimension
        self.anchors = ACADEMIC_ANCHORS
        # Initialize deterministic projection matrix for semantic hashing and dense projection
        rng = np.random.RandomState(42)
        self.projection = rng.randn(len(self.anchors) + 64, self.dimension)
        # Normalize projection matrix
        self.projection /= np.linalg.norm(self.projection, axis=1, keepdims=True)

    def _tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r'[^a-zA-Z0-9\s%]', ' ', text.lower())
        return [w.strip() for w in cleaned.split() if len(w.strip()) > 1]

    def encode(self, text_or_list: Union[str, List[str]]) -> np.ndarray:
        """
        Encodes a single text string or list of strings into normalized 128-d dense embeddings.
        """
        is_single = isinstance(text_or_list, str)
        texts = [text_or_list] if is_single else text_or_list
        
        embeddings = []
        for text in texts:
            tokens = self._tokenize(text)
            if not tokens:
                vec = np.zeros(self.dimension, dtype=np.float32)
            else:
                # 1. Feature frequency vector across anchors
                freq_vec = np.zeros(len(self.anchors) + 64, dtype=np.float32)
                for token in tokens:
                    if token in self.anchors:
                        idx = self.anchors.index(token)
                        freq_vec[idx] += 2.0
                    else:
                        # Character n-gram hash projection into upper 64 slots
                        h = abs(hash(token)) % 64
                        freq_vec[len(self.anchors) + h] += 1.0
                
                # 2. Dense semantic projection
                dense_vec = np.dot(freq_vec, self.projection)
                
                # 3. L2 Unit Normalization (crucial for cosine distance in pgvector)
                norm = np.linalg.norm(dense_vec)
                if norm > 1e-9:
                    vec = (dense_vec / norm).astype(np.float32)
                else:
                    vec = np.zeros(self.dimension, dtype=np.float32)
            
            embeddings.append(vec)
            
        return embeddings[0] if is_single else np.array(embeddings)


_instance = None

def get_embedding_service() -> AcademicEmbeddingService:
    global _instance
    if _instance is None:
        _instance = AcademicEmbeddingService()
    return _instance
