export async function getStaticProps() {
    return {
        redirect: {
            destination: '/gene/A2M?currDatabase=0',
            permanent: false,
        }
    }
}

export default function App() {
    return null
}