import requests
import os
from dotenv import load_dotenv

load_dotenv()

HF_ENDPOINT = os.getenv("HF_ENDPOINT", "")
HF_TOKEN = os.getenv("HF_TOKEN", "")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_DIR = os.path.join(BASE_DIR, "prompt_system")


def read_file(path: str) -> str:
    """Dosyayı oku, yoksa boş string döndür."""
    full_path = os.path.join(PROMPT_DIR, path)
    if os.path.exists(full_path):
        with open(full_path, encoding="utf-8") as f:
            return f.read()
    return ""


def call_hf_endpoint(prompt: str) -> str:
    # HF endpoint henüz bağlı değilse demo cevap döndür
    if not HF_ENDPOINT or "buraya" in HF_ENDPOINT:
        return (
            "**[DEMO MODU]** Model henüz bağlı değil.\n\n"
            "Bu bir test cevabıdır. HuggingFace endpoint bağlandığında "
            "gerçek model cevap verecek.\n\n"
            f"Gönderilen prompt uzunluğu: {len(prompt)} karakter."
        )

    try:
        response = requests.post(
            f"{HF_ENDPOINT}/generate",
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 1024,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "repetition_penalty": 1.15,
                    "do_sample": True,
                }
            },
            timeout=120,
        )
        result = response.json()
        return result[0]["generated_text"]
    except Exception as e:
        return f"Model bağlantı hatası: {str(e)}"


def build_prompt(skill_name: str, history: list, new_message: str) -> str:
    # Tüm dosyaları oku
    system  = read_file("system_promt.md")
    style   = read_file("skills/shared/output_style.md")
    policy  = read_file("skills/shared/question_policy.md")
    context = read_file("skills/shared/competition_context.md")
    skill   = read_file(f"skills/{skill_name}.md")

    # Hepsini birleştir (dokümanındaki mantıkla birebir aynı)
    full_system = "\n\n---\n\n".join(
        part for part in [system, style, policy, context, skill] if part
    )

    # Sohbet geçmişini Mistral formatına çevir
    conversation = ""
    for msg in history:
        if msg["role"] == "user":
            conversation += f"[INST] {msg['content']} [/INST] "
        else:
            conversation += f"{msg['content']}</s>"

    return f"<s>[INST] {full_system}\n\n{conversation}{new_message} [/INST] "