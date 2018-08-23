import md5 from "react-native-md5";

const alphabet = [ 
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export default (str) => {
  str += ''
  let hex = md5.hex_md5(str)
  let res = ''
  let specialTokenPos = parseInt(hex.substr(0, 2), 16) % 12;
  for (let i = 0; i < 12; i++) {
    let index = parseInt(hex.substr(i * 2, 2), 16) % alphabet.length
    res += alphabet[index]
  }
  if (str[0] === '_') {
    res = res.substr(0, specialTokenPos) + '_' + res.substr(specialTokenPos + 1)
  }
  return res
}