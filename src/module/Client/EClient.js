import EApi from "../EimzoPlugin/api/EApi.js";
import _getX500Val from "./utils/_getX500Val.js";
import isBase64 from "./utils/isBase64.js";
import EimzoCryptography from "../EimzoPlugin/cryptography/index.js";


export default class EClient extends EApi{

    constructor(API_KEYS) {
        super()

        if(!API_KEYS || !API_KEYS.length) return false

        this.NEW_API = false
        this.NEW_API2 = false
        this.API_KEYS = API_KEYS
        this.cryptography = new EimzoCryptography()

    }


    async checkVersion() {
        try {
            const data = await super.version()

            if(!data.major || !data.minor) return 'E-IMZO Version is undefined'

            const installedVersion = parseInt(data.major) * 100 + parseInt(data.minor)
            this.NEW_API = installedVersion >= 336
            this.NEW_API2 = installedVersion >= 412
        }catch (e){
            return e
        }


    }

    installApiKeys() {
        return super.apikey(this.API_KEYS)
    }

    getKeys() {
        return new Promise(async (resolve, reject) => {
            if(!this.NEW_API) return reject('Please install new version of E-IMZO')

            if(this.NEW_API2){
                const keys = await this._findPfxs2()

                resolve(keys)
            }else{
                const pfxsData = await this._findPfxs2()
                const tokenData = await this._findTokens2()
                const firstKey = pfxsData.firstKey ?? tokenData.firstKey

                resolve({
                    firstKey,
                    keys: pfxsData.keys
                })
            }
        })
    }

    createPkcs7(id, data, timestamper, isDetached){

        return new Promise((resolve, reject) => {
            let data64 = isBase64(data) ? data : this.cryptography.encode(data)
            let detached = !!isDetached ? 'yes' : 'no'

            const pkcs7 = super.api({plugin: "pkcs7", name: "create_pkcs7", arguments: [data64, id, detached]}).catch(e => reject(e.reason))

            if(!timestamper) resolve(pkcs7)

            const sn = pkcs7.signer_serial_number
            timestamper(pkcs7.signature_hex, async tst => {
                const pkcs7tst = await super.api({plugin:"pkcs7", name:"attach_timestamp_token_pkcs7", arguments:[pkcs7, sn, tst]}).catch(e => reject(e.reason))

                resolve(pkcs7tst)
            })
        })

    }

    async _findPfxs2(){
        const data = await super.api({plugin: "pfx", name: "list_all_certificates"})

        let keys = []
        let itmkey
        for (let rec in data.certificates) {
            const el = data.certificates[rec]
            let x500name_ex = el.alias.toUpperCase()
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.1=", "INN=")
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.2=", "PINFL=")
            const key = {
                disk: el.disk,
                path: el.path,
                name: el.name,
                alias: el.alias,
                serialNumber: _getX500Val(x500name_ex, "SERIALNUMBER"),
                validFrom: new Date(_getX500Val(x500name_ex, "VALIDFROM").replace(/\./g, "-").replace(" ", "T")),
                validTo: new Date(_getX500Val(x500name_ex, "VALIDTO").replace(/\./g, "-").replace(" ", "T")),
                CN: _getX500Val(x500name_ex, "CN"),
                TIN: (_getX500Val(x500name_ex, "INN") ? _getX500Val(x500name_ex, "INN") : _getX500Val(x500name_ex, "UID")),
                UID: _getX500Val(x500name_ex, "UID"),
                PINFL: _getX500Val(x500name_ex, "PINFL"),
                O: _getX500Val(x500name_ex, "O"),
                T: _getX500Val(x500name_ex, "T"),
                type: 'pfx',
            }
            if (!key.TIN && !key.PINFL)
                continue
            itmkey = "itm-" + key.serialNumber + "-" + rec

            keys.push(key)
        }

        return {
            firstKey: itmkey,
            keys
        }
    }

    async _findTokens2(success, fail) {
        const data = await super.api({ plugin: "ftjc", name: "list_all_keys", arguments: [''] })

        let keys = []
        let itmkey
        for (let rec in data.tokens) {
            const el = data.tokens[rec]
            let x500name_ex = el.info.toUpperCase()
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.1=", "INN=")
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.2=", "PINFL=")
            const key = {
                cardUID: el.cardUID,
                statusInfo: el.statusInfo,
                ownerName: el.ownerName,
                info: el.info,
                serialNumber: _getX500Val(x500name_ex, "SERIALNUMBER"),
                validFrom: new Date(_getX500Val(x500name_ex, "VALIDFROM")),
                validTo: new Date(_getX500Val(x500name_ex, "VALIDTO")),
                CN: _getX500Val(x500name_ex, "CN"),
                TIN: (_getX500Val(x500name_ex, "INN") ? _getX500Val(x500name_ex, "INN") : _getX500Val(x500name_ex, "UID")),
                UID: _getX500Val(x500name_ex, "UID"),
                PINFL: _getX500Val(x500name_ex, "PINFL"),
                O: _getX500Val(x500name_ex, "O"),
                T: _getX500Val(x500name_ex, "T"),
                type: 'ftjc',
            }
            if (!key.TIN && !key.PINFL)
                continue
            itmkey = "itm-" + key.serialNumber + "-" + rec

            keys.push(key)
        }

        return {
            firstKey: itmkey,
            keys
        }
    }



}