# pgvector Semantic Knowledge Retrieval

EduInsight AI uses PostgreSQL with the `pgvector` extension to implement semantic retrieval over institutional academic policies and guidance notes.

## Storage Schema

```sql
CREATE TABLE IF NOT EXISTS academic_knowledge_vector (
    doc_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    source VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Retrieval Pipeline

1. **Query Formulation:** Formulated from detected risk factors and primary SHAP drivers.
2. **Embedding:** Computed via 384-dimensional dense embeddings (`all-MiniLM-L6-v2` or deterministic dense encoder).
3. **Cosine Similarity Search:** Executed via PostgreSQL cosine distance (`<=>` operator):
   ```sql
   SELECT doc_id, title, category, source, content,
          1 - (embedding <=> $1) AS similarity
   FROM academic_knowledge_vector
   WHERE 1 - (embedding <=> $1) >= $2
   ORDER BY similarity DESC
   LIMIT $3;
   ```
4. **Intervention Enrichment:** Retrieved policy snippets enrich the prescriptive action plan without overriding rule-based logic.
