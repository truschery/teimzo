var uiLoading = function () {
  var l = document.getElementById('message')
  l.innerHTML = 'Загрузка ...'
  l.style.color = 'red'
}

var uiNotLoaded = function (e) {
  var l = document.getElementById('message')
  l.innerHTML = ''
  if (e) {
    wsError(e)
  } else {
    uiShowMessage(errorBrowserWS)
  }
}

var uiUpdateApp = function () {
  var l = document.getElementById('message')
  l.innerHTML = errorUpdateApp
}

var uiAppLoad = function () {
  uiClearCombo()
  EIMZOClient.listAllUserKeys(function (o, i) {
    return "itm-" + o.serialNumber + "-" + i
  }, function (itemId, v) {
    return uiCreateItem(itemId, v)
  }, function (items, firstId) {
    const expiredAt = new Date()

    expiredAt.setHours(expiredAt.getHours() + 5)

    localStorage.setItem('eimzoKeys', JSON.stringify({
      profile_uuid: window.currentProfile.profile_uuid,
      expired_at: expiredAt.getTime(),
      keys: items.map(signature => {
        const vo = signature.getAttribute('vo')
        const data = JSON.parse(vo)

        return {
          id: signature.value,
          name: data.O,
          data,
        }
      }),
    }))

    uiFillCombo(items)
    uiLoaded()
    window.eimzoEmitter.emit('eimzo:keys-loaded', items)
    uiComboSelect(firstId)
  }, function (e, r) {
    if (e) {
      uiShowMessage(errorCAPIWS + " : " + e)
    } else {
      console.log(r)
    }
  })
  EIMZOClient.idCardIsPLuggedIn(function (yes) {
    document.getElementById('plugged').innerHTML = yes ? 'подключена' : 'не подключена'
  }, function (e, r) {
    if (e) {
      uiShowMessage(errorCAPIWS + " : " + e)
    } else {
      console.log(r)
    }
  })
}

var uiComboSelect = function (itm) {
  if (itm) {
    var id = document.getElementById(itm)
    id.setAttribute('selected', 'true')
  }
}

var cbChanged = function (c) {
  // document.getElementById('keyId').innerHTML = '';
}

var uiClearCombo = function () {
  var combo = document.testform.key
  combo.length = 0
}

var uiFillCombo = function (items) {
  var combo = document.testform.key
  for (var itm in items) {
    combo.append(items[itm])
  }
}

var uiLoaded = function () {
  var l = document.getElementById('message')
  l.innerHTML = ''
}

var uiCreateItem = function (itmkey, vo) {
  var now = new Date()
  vo.expired = dates.compare(now, vo.validTo) > 0
  var itm = document.createElement("option")
  itm.value = itmkey
  itm.text = vo.CN
  if (!vo.expired) {

  } else {
    itm.style.color = 'gray'
    itm.text = itm.text + ' (срок истек)'
  }
  itm.setAttribute('vo', JSON.stringify(vo))
  itm.setAttribute('id', itmkey)
  
  return itm
}

var keyType_changed = function () {
  var keyType = document.testform.keyType.value
  document.getElementById('signButton').innerHTML = keyType === "pfx" ? "Вход ключем PFX" : "Вход ключем ID-card"
}

keyType_changed()

var uiShowProgress = function () {
  var l = document.getElementById('progress')
  l.innerHTML = 'Идет подписание, ждите.'
  l.style.color = 'green'
}

var uiHideProgress = function () {
  var l = document.getElementById('progress')
  l.innerHTML = ''
}

sign = function (itm, callback, data, attach = false) {
  uiShowProgress()

  const keyType = document.testform.keyType.value

  if(keyType === 'idcard'){
    const keyId = 'idcard'

    if (attach) {
      appendPkcs7Attached(keyId, data, function(redirect){
        window.location.href = redirect
        uiShowProgress()
      })
    } else {
      createPkcs7(keyId, data, function(redirect){
        window.location.href = redirect
        uiShowProgress()
      })
    }
  } else {
    // if (window.app_type === 'dev') {
    return newSign(itm, callback, data, attach)

    // } else {
    //   return oldSign(itm, callback, data, attach)
    // }
  }
}

newSign = function (itm, callback, data, attach = false) {
  if (itm) {
    const eimzoKeys = JSON.parse(localStorage.getItem('eimzoKeys'))

    const keys = eimzoKeys?.keys
    const vo = keys?.find(key => key.id === itm)

    if (vo?.key_id) {
      if (attach) {
        appendPkcs7Attached(vo.key_id, data, callback)
      } else {
        createPkcs7(vo.key_id, data, callback)
      }
    } else {
      EIMZOClient.loadKey(vo.data, function(id){
        vo.key_id = id
        localStorage.setItem('eimzoKeys', JSON.stringify(eimzoKeys))
        if (attach) {
          appendPkcs7Attached(id, data, callback)
        } else {
          createPkcs7(id, data, callback)
        }
      }, uiHandleError)
    }
  } else {
    uiHideProgress()
  }
}

oldSign = function (itm, callback, data, attach = false) {
  if (itm) {
    const id = document.getElementById(itm)
    const vo = JSON.parse(id.getAttribute('vo'))

    EIMZOClient.loadKey(vo, function(id){
      debugger
      if (attach) {
        appendPkcs7Attached(id, data, callback)
      } else {
        createPkcs7(id, data, callback)
      }
    }, uiHandleError)
  } else {
    uiHideProgress()
  }
}

createPkcs7 = function (keyId, data, callback) {
  EIMZOClient.createPkcs7(keyId, data, window.timestamper, function (pkcs7) {
    callback(pkcs7)
  }, uiHandleError, false)
}

appendPkcs7Attached = function (keyId, data, callback) {
  EIMZOClient.appendPkcs7Attached(keyId, data, window.timestamper, function (pkcs7) {
    callback(pkcs7)
  }, uiHandleError, false)
}

// window.onload = AppLoad;
window.eimzoInit = AppLoad



































// let me = this,
//     keyId;
//
// for (let i = 0; i < document.testform.key.options.length; i++) {
//   let vo = JSON.parse(
//       document.testform.key.options[i].getAttribute("vo"),
//   );
//   if (vo.TIN === me.profileStore.data.company_tin && !vo.expired) {
//     keyId = document.testform.key.options[i].id;
//   }
// }
//
// document.testform.key.value = keyId;
// if (me.formData.scanFile) {
//   let fileResponse = await fetch(
//       config.api.baseUrl + "/crm/v1/company/upload",
//       {
//         method: "post",
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("access_token"),
//         },
//         body: me.formData.scanFile,
//       },
//   );
//
//   fileResponse = await fileResponse.json();
//
//   me.formData.documentPath = fileResponse.data.path;
// }
// let contract_data_el = document.getElementById("contract-data");
// me.formData.session_id = localStorage.getItem("session_id");
//
// me.formData.contract = contract_data_el
//     ? contract_data_el.innerHTML
//     : null;
// window.reFormatData = JSON.stringify(me.reFormat(me.formData));
// signin(async function(keyId, pcks7) {
//   console.log(pcks7)
// });
