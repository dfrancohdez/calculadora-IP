import React from 'react'
import { useState } from 'react';
import Red from './Red'
import SubRedes from './subredes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Form = () => {
    const [ip, setIp] = useState("")
    const [boton, setBoton] = useState(false)
    const [inputMask, setMask] = useState("")
    const [datos, setDatos] = useState([])
    const [red, SetRed] = useState({
        hosts: '',
        classIp: '',
        netMask: ''
    }
    )

    const onFormUpdate = (event) => {
        const { name, value, type } = event.target

        if (name === "ip")
            setIp(value);
        if (name === "mascara")
            setMask(value);
    }
    const handleSubmit = () => {
        setDatos([])
        
        //Validaciones
        
        const validacionIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        const validacionMask = /^([0-9]|[1-2][0-9]|3[0-2])$/;
        //mensajes de error
        if(!validacionIP.exec(ip)) {
            toast.error("Valor ip no valido", {
                position: "bottom-center"
            });
            console.log("error")
          return;
        }
      
        if(!validacionMask.exec(inputMask)) {
            toast.errror("Valor de mascara no valido", {
                position: "bottom-center",
            });
          return;
        }
        setBoton(true)


        //Dividiendo la direccion ip en un arreglo
        const dirIp = getDirIp(ip);

        //String a entero
        const mask = parseInt(inputMask);

        //Pasando mascara a decimal.
        const netMask = getnetMask(mask);

        //Obteniendo la direccion de red.
        let dirRed = [dirIp[0], 0, 0, 0];
        
        //Obteniendo clase
        let classIp = "A";
        let numSubRedes = Math.pow(2, mask - 8);
        let hosts = Math.pow(2, 24) - 2;
        if (dirIp[0] >= 128 && dirIp[0] <= 191) {
            numSubRedes = Math.pow(2, mask - 16);
            hosts = Math.pow(2, 16) - 2;
            dirRed = [dirIp[0], dirIp[1], 0, 0];
            classIp = "B";
        } else if (dirIp[0] >= 192 && dirIp[0] <= 223) {
            numSubRedes = Math.pow(2, mask - 24);
            hosts = Math.pow(2, 8) - 2;
            dirRed = [dirIp[0], dirIp[1], dirIp[2], 0];
            classIp = "C";
        } else if (dirIp[0] >= 224 && dirIp[0] <= 239) {
            classIp = "D"
        } else if (dirIp[0] >= 240 && dirIp[0] <= 255) {
            classIp = "E";
        }
        SetRed(
            prev => ({
                hosts,
                classIp,
                netMask
            })
        )


        const delta = Math.pow(2, 32 - mask);
        let broadcastArray = getHostMask(32 - mask);
        for (let i = 0; i < 4; i++)
            broadcastArray[i] |= dirRed[i];

        let minHostArray = dirRed.map((num) => num);
        let maxHostArray = broadcastArray.map((num) => num);
        minHostArray[3] += 1;
        maxHostArray[3] -= 1;






        if(numSubRedes>500){
            
            toast.success("Hay "+numSubRedes+" SubRedes, pero se muestran 500", {
                position: "bottom-center",
            })
            
            numSubRedes=500;
        }
        for (let i = 1; i <= numSubRedes; i++) {
            let network=[...dirRed]
            let newItem = {
                i,
                dirRed:network,
                minHostArray,
                maxHostArray,
                broadcastArray,
                delta
            }

            setDatos(prev => [...prev, newItem])
            
            //Broadcast
            broadcastArray = getHostMask(32 - mask);
            sum(dirRed, delta);
            for (let j = 0; j < 4; j++)
                broadcastArray[j] |= dirRed[j];

            //minimo y maximo
            minHostArray = dirRed.map((num) => num);
            maxHostArray = broadcastArray.map((num) => num);
            minHostArray[3] += 1;
            maxHostArray[3] -= 1;
        }
        console.log(datos[0])
    }





   
    //se agregan los puntos al arreglo
    const toString = (ip) => {
        let ipString = "";
        for (let i = 0; i < 4; i++) {
            ipString += ip[i] + "";
            if (i != 3) ipString += ".";
        }

        return ipString;
    };

    const getHostMask = (hostBits) => {
        const hostMask = [];
        let power = 128;
        for (let i = 0; i < 32; i++) {
            if (i % 8 === 0) {
                hostMask.push(0);
                power = 128;
            } else
                power = Math.ceil(power / 2);

            if (i >= 32 - hostBits) {
                hostMask[hostMask.length - 1] += power;
            }
        }

        return hostMask;
    };
    const sum = (arr, x) => {
        let rem = 0;
        for (let i = 3; i >= 0; i--) {
            if (i === 3) {
                arr[i] += x;
            }

            arr[i] += rem;
            rem = Math.floor(arr[i] / 256);
            arr[i] %= 256;
        }

        return arr;
    };
    const getnetMask = (mask) => {
        const aux = [];

        let power = 128;
        for (let i = 0; i < 32; i++) {
            if (i % 8 === 0) {
                aux.push(0);
                power = 128;
            } else
                power = Math.ceil(power / 2);

            if (mask > 0) {
                aux[aux.length - 1] += power;
                mask -= 1;
            }
        }

        return aux;
    };

    const getDirIp = (ip) => {
        const dirIp = [];
        let num = "";
        for (let c of ip) {
            if (c === ".") {
                dirIp.push(parseInt(num));
                num = "";
            } else {
                num += c;
            }
        }

        dirIp.push(parseInt(num));
        return dirIp;
    }


    return (
        <div>
            <div className='container-form'>
                <form className='form' action='none'>
                    <input placeholder='IP' type='text' onChange={onFormUpdate} name='ip' value={ip} />
                    <input placeholder='NetMask' type='text' onChange={onFormUpdate} name='mascara' value={inputMask} />
                    <button type='button' onClick={handleSubmit}>Calcular</button>
                </form>
            </div>
            <ToastContainer />
            {boton&&<Red noHost={red.hosts} clase={red.classIp} netmask={toString(red.netMask)} />}
            <div className='subredes'>
            {datos.length>0&&
                datos.map((dato) => (
                    <SubRedes
                        i={dato.i}

                        dirRed={toString(dato.dirRed)}

                        minHostArray={toString(dato.minHostArray)}

                        maxHostArray={toString(dato.maxHostArray)}

                        broadcastArray={toString(dato.broadcastArray)}

                        delta={dato.delta - 2}
                    />

                ))
            }
            
            </div>
        </div>
    )
}
export default Form;