const os = require("os");

const networkInterfaces = os.networkInterfaces();

export const getIpv4Address = () => {
//     for(const network of Object.values(networkInterfaces) ) {
//         if(!network) continue;
//         console.log(network)
//         for(const address of network) {
//             if(address.family === "IPv4" && !address.internal) {
//                 return address.address || "";
//             }
//     }
//     return "";
//  }
    if("Wi-Fi 4" in networkInterfaces) {
        for(const address of networkInterfaces["Wi-Fi 4"]) {
            if(address.family === "IPv4" && !address.internal) {
                return address.address || "";
            }
        }
        return "";
    }
}
