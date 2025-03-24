import os from "os";

const networkInterfaces = os.networkInterfaces();

export const getIpv4Address = () => {
    for(const network of Object.values(networkInterfaces) ) {
        if(!network) continue;
        for(const address of network) {
            if(address.family === "IPv4" && !address.internal) {
                return address.address || "";
            }
    }
    return "";
 }
}