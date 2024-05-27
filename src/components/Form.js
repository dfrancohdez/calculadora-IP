import React from 'react'
import { useState } from 'react';
import Red from './Red'
import SubRedes from './subredes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Form = () => {
    const [ip, setIp] = useState("")
    const [boton, setBoton] = useState(false)
    const [enteredMask, setMask] = useState("")
    const [datos, setDatos] = useState([])
    const [red, SetRed] = useState({
        hosts: '',
        classOfIp: '',
        arrayMask: ''
    }
    )

    const onFormUpdate = (event) => {
        const { name, value, type } = event.target
        /*setFormDetail(prev => {
            return {
                ...prev,
                [name]: value

            }
        })*/

        if (name === "ip")
            setIp(value);
        if (name === "mascara")
            setMask(value);
    }
    const handleSubmit = () => {
        setDatos([])
        
        //Extrayendo los elementos de la pagina:



        //Expresiones regulares.
        
        const expIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const expMask = /^([0-9]|[1-2][0-9]|3[0-2])$/;
      
        if(!expIP.exec(ip)) {
            toast.error("Valor ip no valido", {
                position: "bottom-center"
            });
            console.log("error")
          return;
        }
      
        if(!expMask.exec(enteredMask)) {
            toast.errror("Valor de mascara no valido", {
                position: "bottom-center",
            });
          return;
        }
        setBoton(true)
        //Ocultando mensaje de error.
        //errorDialog.style.display = "none";

        //Convirtiendo la IP a un arreglo de numeros enteros.
        const arrayIP = getArrayIP(ip);

        //Convertiendo la mascara a entero.
        const mask = parseInt(enteredMask);

        //Conviertiendo la mascara a un arreglo.
        const arrayMask = getArrayMask(mask);

        //Obteniendo la direccion de red.
        let networkAddress = [arrayIP[0], 0, 0, 0];
        //Obteniendo la clase de la red.
        let classOfIp = "A";
        let numSubnets = Math.pow(2, mask - 8);
        let hosts = Math.pow(2, 24) - 2;
        if (arrayIP[0] >= 128 && arrayIP[0] <= 191) {
            numSubnets = Math.pow(2, mask - 16);
            hosts = Math.pow(2, 16) - 2;
            networkAddress = [arrayIP[0], arrayIP[1], 0, 0];
            classOfIp = "B";
        } else if (arrayIP[0] >= 192 && arrayIP[0] <= 223) {
            numSubnets = Math.pow(2, mask - 24);
            hosts = Math.pow(2, 8) - 2;
            networkAddress = [arrayIP[0], arrayIP[1], arrayIP[2], 0];
            classOfIp = "C";
        } else if (arrayIP[0] >= 224 && arrayIP[0] <= 239) {
            classOfIp = "D"
        } else if (arrayIP[0] >= 240 && arrayIP[0] <= 255) {
            classOfIp = "E";
        }
        SetRed(
            prev => ({
                hosts,
                classOfIp,
                arrayMask
            })
        )


        //Salto
        const delta = Math.pow(2, 32 - mask);
        let broadcastArray = getHostMask(32 - mask);
        for (let i = 0; i < 4; i++)
            broadcastArray[i] |= networkAddress[i];

        let minHostArray = networkAddress.map((num) => num);
        let maxHostArray = broadcastArray.map((num) => num);
        minHostArray[3] += 1;
        maxHostArray[3] -= 1;







        for (let i = 1; i <= numSubnets; i++) {
            let newItem = {
                i,
                arrayMask,
                networkAddress,
                minHostArray,
                maxHostArray,
                broadcastArray,
                delta
            }

            setDatos(prev => [...prev, newItem])
            //Obteniendo el broadcast
            broadcastArray = getHostMask(32 - mask);
            sum(networkAddress, delta);
            for (let j = 0; j < 4; j++)
                broadcastArray[j] |= networkAddress[j];

            //Obteniendo el host minimo y maximo de la red
            minHostArray = networkAddress.map((num) => num);
            maxHostArray = broadcastArray.map((num) => num);
            minHostArray[3] += 1;
            maxHostArray[3] -= 1;
        }
        console.log(datos)
    }





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

    const convertIPToString = (ip) => {
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

    const getArrayMask = (mask) => {
        const maskArray = [];

        let power = 128;
        for (let i = 0; i < 32; i++) {
            if (i % 8 === 0) {
                maskArray.push(0);
                power = 128;
            } else
                power = Math.ceil(power / 2);

            if (mask > 0) {
                maskArray[maskArray.length - 1] += power;
                mask -= 1;
            }
        }

        return maskArray;
    };

    const getArrayIP = (ip) => {
        const arrayIP = [];
        let num = "";
        for (let c of ip) {
            if (c === ".") {
                arrayIP.push(parseInt(num));
                num = "";
            } else {
                num += c;
            }
        }

        arrayIP.push(parseInt(num));
        return arrayIP;
    }


    return (
        <div>
            <div className='container-form'>
                <form className='form' action='none'>
                    <input placeholder='ip' type='text' onChange={onFormUpdate} name='ip' value={ip} />
                    <input placeholder='mask' type='text' onChange={onFormUpdate} name='mascara' value={enteredMask} />
                    <button type='button' onClick={handleSubmit}>Calcular</button>
                </form>
            </div>
            <ToastContainer />
            {boton&&<Red noHost={red.hosts} clase={red.classOfIp} netmask={convertIPToString(red.arrayMask)} />}
            <div className='subredes'>
            {datos.length>0&&
                datos.map((dato) => (
                    <SubRedes
                        i={dato.i}

                        networkAddress={convertIPToString(dato.networkAddress)}

                        minHostArray={convertIPToString(dato.minHostArray)}

                        maxHostArray={convertIPToString(dato.maxHostArray)}

                        broadcastArray={convertIPToString(dato.broadcastArray)}

                        delta={dato.delta}
                    />

                ))
            }
            
            </div>
        </div>
    )
}
export default Form;