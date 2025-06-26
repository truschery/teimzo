
import {EClient} from './app/index.js'

const API_KEYS = [
    'localhost',
    '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
    '127.0.0.1',
    'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
]



const Client = new EClient(API_KEYS)

const appLoad = () => {
    return new Promise((resolve, reject) => {
        Client.checkVersion((major, minor) => {
            // Client.installApiKeys(() => {
            //
            //     resolve(true)
            // })
        })
    })
}

const main = async () => {
    await Client.checkVersion()
    await Client.installApiKeys()

    const keys = await Client.getKeys()

    console.log(keys)

//     Client.getKeys(keys => {
//         console.log(keys)
//     }, error => {
//         console.log(error)
//     })
}


main()




