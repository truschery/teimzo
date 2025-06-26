export default function (text, value) {
    const textParams = text.split(',')

    const findText = textParams.find(textParam => textParams.indexOf(textParam) !== -1)

    if (!findText) return false

    const splitValue = findText.split('=')
    return splitValue[1].trim()
}