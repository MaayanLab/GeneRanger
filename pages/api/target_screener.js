export default async function handler(req, res) {

    if (req.method === 'POST') {

        const input = req.body;
        console.log(input)
        //TODO: make this actually do something
        res.status(200).json(input);

    }
}