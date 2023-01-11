
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb' // Set desired value here
        }
    }
}

export default async function handler(req, res) {

    if (req.method === 'POST') {
        
        const input = req.body;
        console.log(input)
        
        var res = await fetch("https://appyters.maayanlab.cloud/Gene_Expression_T2D_Signatures/", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
        })

        const id = await res.json()

        const final_url = "https://appyters.maayanlab.cloud/Tumor_Gene_Target_Screener/" + id.session_id

        response = requests.get(final_url)


        

        res.status(200).json(input);

    }
}