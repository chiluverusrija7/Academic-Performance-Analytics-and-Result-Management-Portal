"""
Retrieval-Augmented Academic Guidance Helper.
Connects student risk evidence (SHAP drivers, checkpoint, intervention type)
to pgvector semantic search to retrieve traceable institutional regulations.
"""

from typing import Dict, Any, List, Optional
from vector.vector_store import get_vector_store

def retrieve_guidance_for_risk_profile(
    top_driver: str,
    checkpoint: str = "W12",
    intervention_type: Optional[str] = None,
    risk_category: str = "HIGH"
) -> List[Dict[str, Any]]:
    """
    Constructs a semantic query from risk factors and queries the vector store
    for the most relevant institutional academic policies.
    """
    store = get_vector_store()
    
    # Formulate rich query representation
    query_parts = [
        f"Academic Risk Factor: {top_driver}",
        f"Temporal Checkpoint: {checkpoint}",
        f"Risk Category: {risk_category}"
    ]
    if intervention_type:
        query_parts.append(f"Intervention Action: {intervention_type}")
        
    query_text = " • ".join(query_parts)
    
    matched_policies = store.search_similar_policies(query_text, top_k=2, min_score=0.15)
    return matched_policies
