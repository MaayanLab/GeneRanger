from openai import OpenAI
from dotenv import load_dotenv
import os
import json
load_dotenv()


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def categorize(labels):
    system_prompt = {"role": "system", "content": "Categorize the following labels into the following categories: Connective Tissue, Digestive System, Immune System, Integumentary System, Muscular System, Nervous System, Urogenital/Reproductive System, Respiratory System, Cardiovascular System"}
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[system_prompt, {"role": "user", "content": "Categorize the following labels in the following format (output in json format): [label]: [category] \n" + "\n".join(labels) + "\n"}],
        response_format={ "type": "json_object" }
    )

    return response.choices[0].message.content


filename = 'hubmap'
with open(f'{filename}.txt', 'r') as f:
    labels = f.read().split('\t')


for i in range(0, len(labels), 100):
    res = categorize(labels[i:i+100])
    res_json = json.loads(res)
    with open(f'categories/{filename}{i}.json', 'w') as f:
        json.dump(res_json, f)


cats = os.listdir('categories')
categories = {
}

for cat in cats:
    with open(f'categories/{cat}', 'r') as f:
        data = json.load(f)
        categories.update(data)

with open('categories.json', 'w') as f:
    json.dump(categories, f, indent=4)

