from sentence_transformers import SentenceTransformer

# Load the local model in memory (downloads on first run, ~80MB)
model = SentenceTransformer('all-MiniLM-L6-v2')

async def generate_embedding(text: str) -> list[float]:
    """Generates a text embedding using local Hugging Face model."""
    # model.encode returns a numpy array, we convert it to a regular python list
    embedding = model.encode(text)
    return embedding.tolist()
