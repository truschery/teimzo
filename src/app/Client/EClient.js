import EApi from "../EimzoPlugin/api/EApi.js";
import _getX500Val from "./utils/_getX500Val.js";


export default class EClient extends EApi{

    constructor(API_KEYS) {
        super()

        if(!API_KEYS || !API_KEYS.length) return false

        this.CLIENT = {
            NEW_API: false,
            NEW_API2: false,
            API_KEYS,
            checkVersion: this.checkVersion,
            installKeys: this.installApiKeys,
        }

    }





    checkVersion(success, fail) {
        super.version(data => {
            if(!data.major || !data.minor) return fail('E-IMZO Version is undefined')

            var installedVersion = parseInt(data.major) * 100 + parseInt(data.minor)
            this.CLIENT.NEW_API = installedVersion >= 336
            this.CLIENT.NEW_API2 = installedVersion >= 412

            success(data.major, data.minor)
        }, () => {
            fail('WebSocket is undefined')
        })
    }

    installApiKeys(success, fail) {
        super.apikey(this.CLIENT.API_KEYS, success, fail)
    }

    getKeys(success, fail) {
        if(!EIMZOClient.NEW_API) return fail && fail('Please install new version of E-IMZO')

        if(this.CLIENT.NEW_API2){
            this._findPfxs2(success, fail)
        }else{
            this._findPfxs2((firstItmId2, keys ) => {
                this._findTokens2((firstItmId3) => {
                    const firstId = firstItmId2 ?? firstItmId3

                    success && success(firstId, keys)
                })
            })
        }
    }

    private _findPfxs2(success, fail){
        super.api({plugin: "pfx", name: "list_all_certificates"},
            data => {
                let keys = []
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
                    let itmkey = "itm-" + key.serialNumber + "-" + rec

                    keys.push(key)

                    success && success(itmkey, keys)
                }
            },
            () => {
                // TODO: set normal error
                fail && fail('error in get list')
            })
    }

    private _findTokens2(success, fail) {
        super.api({ plugin: "ftjc", name: "list_all_keys", arguments: [''] }, data => {
            let keys = []
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
                var itmkey = "itm-" + key.serialNumber + "-" + rec

                keys.push(key)

                success && success(itmkey, keys)
            }
        }, (e) => {
            fail && fail(e)
        })
    }

    private getNewApiV2(success, fail){
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

    private getNewApi(){

    }

}