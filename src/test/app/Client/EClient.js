import EApi from "../EimzoPlugin/api/EApi.js";
import _getX500Val from "./utils/_getX500Val.js";
import getX500Val from "./utils/getX500.js";


export default class EClient extends EApi{

    constructor(API_KEYS) {
        super()

        if(!API_KEYS || !API_KEYS.length) return false


        this.NEW_API = false
        this.NEW_API2 = false
        this.API_KEYS = API_KEYS
    }





    async checkVersion(success, fail) {
        return new Promise(async (resolve, reject) => {
            const data = await super.version(success, fail)

            if(!data.major || !data.minor) return reject('E-IMZO Version is undefined')

            const installedVersion = parseInt(data.major) * 100 + parseInt(data.minor)

            this.NEW_API = installedVersion >= 336
            this.NEW_API2 = installedVersion >= 412


            resolve({
                major: data.major,
                minor: data.minor,
            })
        })
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
                const keys = await this._findPfxs2()
                const itm = await this._findTokens2()


                resolve({ firstItm: itm.itmkey, keys  })
            }
        })
    }

    _findPfxs2(){

        return new Promise(async (resolve, reject) => {
            const data = await super.api({plugin: "pfx", name: "list_all_certificates"})

            if(!data) return false

            let keys = []
            let itmkey = null
            for (let rec in data.certificates) {
                const el = data.certificates[rec]
                let x500name_ex = el.alias.toUpperCase()
                x500name_ex = x500name_ex.replace("1.2.860.3.16.1.1=", "INN=")
                x500name_ex = x500name_ex.replace("1.2.860.3.16.1.2=", "PINFL=")

                console.log(x500name_ex)
                const key = {
                    disk: el.disk,
                    path: el.path,
                    name: el.name,
                    alias: el.alias,
                    serialNumber: getX500Val(x500name_ex, "SERIALNUMBER"),
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

            resolve({ itmkey, keys })
        })
    }

    _findTokens2() {

        return new Promise(async (resolve, reject) => {
            const data = await super.api({ plugin: "ftjc", name: "list_all_keys", arguments: [''] })

            let keys = []
            let itmkey = null
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

            resolve({ itmkey, keys })
        })
    }

    getNewApiV2(success, fail){
        this._findPfxs2((firstItmId2, keys) => {
            let firstId = null
            if (keys.length === 1) {
                if (firstItmId2) {
                    firstId = firstItmId2
                }
            }
            success(keys, firstId)
        })
    }

    getNewApi(){

    }

}