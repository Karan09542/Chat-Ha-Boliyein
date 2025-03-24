import qrcode from "qrcode-terminal"

qrcode.generate("192.168.31.168:3000", {small: true})