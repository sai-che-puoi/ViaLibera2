# This scripts calls a openAI compatible API to enhance a given italian text, cleaning it up and making more grammaticaly and semanticly correct.

import requests
import os

def enhance_text(input_text, api_url, api_key, model, params=None):
    """
    Enhance the given Italian text using an OpenAI compatible API.
    The default system prompt is designed to improve grammar, clarity, and style while preserving the original meaning and tone.

    Parameters:
    - input_text (str): The Italian text to be enhanced.
    - api_url (str): The URL of the OpenAI compatible API endpoint.
    - api_key (str): The API key for authentication.
    - params (dict, optional): Additional parameters for the API call.

    Returns:
    - str: The enhanced text.
    """

    system_prompt = """
    
    Sei un esperto di lingua italiana e di revisione testuale.
    Il tuo compito è correggere solo errori evidenti di trascrizione (parole sbagliate, errori grammaticali o sintattici) mantenendo il significato, lo stile e il tono originale del testo.
    Non riscrivere frasi che sono già corrette, non aggiungere né togliere informazioni.
    Il testo è una risposta alla domanda: "Immagina di camminare nella Milano che vorresti: cosa vedi, cosa è cambiato?" ed è parte di un'intervista sugli spazi urbani a Milano.
    Se nel testo è presente parte della domanda, rimuovila.
    Fornisci solo il testo corretto, senza spiegazioni o commenti.
    """

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Migliora il seguente testo in italiano:\n\n{input_text}"
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1024
    }
    if params:
        payload.update(params)

    response = requests.post(api_url, headers=headers, json=payload, verify=False)

    if response.status_code == 200:
        result = response.json()
        enhanced_text = result['choices'][0]['message']['content']
        return enhanced_text
    else:
        raise Exception(f"API request failed with status code {response.status_code}: {response.text}")