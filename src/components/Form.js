import React from 'react'
import { useState } from 'react';
import Red from './Red'
import SubRedes from './subredes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Form = () => {
    const [ip, setIp] = useState("")
    const [inputMask, setMask] = useState("")
    const [datos, setDatos] = useState([])
    const [buscar, setBuscar] = useState("")
    const [buscarBoton,setBuscarBoton]=useState(false)
    const [validacion,setValidacion]=useState(false)
    const [red, SetRed] = useState({
        hosts: '',
        classIp: '',
        netMask: '',
        numSubRedes: '',
    }
    )

    const onFormUpdate = (event) => {
        const { name, value, type } = event.target

        if (name === "ip")
            setIp(value);
        if (name === "mascara")
            setMask(value);
        if (name === "buscar"){
            setBuscar(value);
            //setBuscarBoton(false)
        }
            
    }
    const handleSubmit = () => {
        setDatos([])

        //Validaciones

        const validacionIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        const validacionMask = /^([0-9]|[1-2][0-9]|3[0-2])$/;
        //mensajes de error
        if(!validacionIP.exec(ip)) {
            setValidacion(false);
            toast.error("Valor ip no valido", {
                position: "bottom-center"
            });
            console.log("error")
            return;
        }
      
        if(!validacionMask.exec(inputMask)) {
            setValidacion(false);
            toast.error("Valor de mascara no valido", {
                position: "bottom-center",
            });
            return;
        }
        setValidacion(true)


        //Dividiendo la direccion ip en un arreglo
        const dirIp = getDirIp(ip);

        //String a entero
        const mask = parseInt(inputMask);

        //Pasando mascara a decimal.
        const netMask = getnetMask(mask);
        let dirRed;
        let classIp;
        let numSubRedes;
        let hosts;
        //identifico clase
        if (dirIp[0] >= 128 && dirIp[0] <= 191) {
            numSubRedes = Math.pow(2, mask - 16);//numero de subRedes
            hosts = Math.pow(2, 16) - 2;//numero de host
            dirRed = [dirIp[0], dirIp[1], 0, 0];
            classIp = "B";
        } else if (dirIp[0] >= 192 && dirIp[0] <= 223) {
            numSubRedes = Math.pow(2, mask - 24);//24-24 no hay subred
            hosts = Math.pow(2, 8) - 2;
            dirRed = [dirIp[0], dirIp[1], dirIp[2], 0];
            classIp = "C";
        } else if (dirIp[0] >= 224 && dirIp[0] <= 239) {
            classIp = "D"
        } else if (dirIp[0] >= 240 && dirIp[0] <= 255) {
            classIp = "E";
        } else {
            numSubRedes = Math.pow(2, mask - 8);
            hosts = Math.pow(2, 24) - 2;
            dirRed = [dirIp[0], 0, 0, 0];
            classIp = "A";
        }
        const num = numSubRedes;
        SetRed(
            prev => ({
                hosts: hosts,
                classIp: classIp,
                netMask: netMask,
                numSubRedes: num
            })
        )

        //host por red
        const salto = Math.pow(2, 32 - mask);
        //obtengo la mascara de los host: 0.0.255.255
        //envio cantidad de bits de host
        let broadcastArray = getHostMask(32 - mask);
        //uno la direccion de red con la mascara de host
        //127.0.0.0 || 0.0.0.255 -> 127.0.0.255
        for (let i = 0; i < 4; i++)
            broadcastArray[i] |= dirRed[i];

        let minHost = dirRed.map((num) => num);//copio el arreglo a otro arreglo
        let maxHost = broadcastArray.map((num) => num);//copio el arreglo a otro arreglo
        //a la direccion de red le sumo uno: 127.0.0.0->127.0.0.1
        minHost[3] += 1;
        //a la direccion de broadcast le resto uno: 127.0.0.255->127.0.0.254
        maxHost[3] -= 1;



        //limito el arreglo a 500 items
        if (numSubRedes > 500) {

            toast.success("Hay " + numSubRedes + " SubRedes, pero se muestran 500", {
                position: "bottom-center",
            })

            numSubRedes = 500;
        }
        //recorro todas las subredes
        for (let i = 1; i <= numSubRedes; i++) {
            //creo nuevo objeto, ya que la funcion sum lo modifica al pasarse por referencia
            let network = [...dirRed]
            let newItem = {
                i,
                dirRed: network,
                minHost,
                maxHost,
                broadcastArray,
                salto//host por red
            }
            //guardo los datos
            setDatos(prev => [...prev, newItem])

            //Broadcast
            broadcastArray = getHostMask(32 - mask);
            siguienteRed(dirRed, salto);//sumo la direccion de red con los host por red
            //uno la direccion de red con la mascara de host
            //127.0.0.0 || 0.0.0.255 -> 127.0.0.255
            for (let j = 0; j < 4; j++)
                broadcastArray[j] |= dirRed[j];

            //minimo y maximo
            minHost = dirRed.map((num) => num);//copio el arreglo a otro arreglo
            maxHost = broadcastArray.map((num) => num);//copio el arreglo a otro arreglo
            //a la direccion de red le sumo uno: 127.0.0.0->127.0.0.1
            minHost[3] += 1;
            //a la direccion de broadcast le resto uno: 127.0.0.255->127.0.0.254
            maxHost[3] -= 1;
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
    //obtengo la mascara de los host: 0.0.255.255
    const getHostMask = (hostBits) => {
        const aux = [];
        let suma = 128;
        for (let i = 0; i < 32; i++) {
            if (i % 8 === 0) {
                aux.push(0);
                suma = 128;
            } else
                suma = Math.ceil(suma / 2);//128 64 32 16 8 4 2 1=255

            if (i >= 32 - hostBits) {//hasta que legue al bit del host
                aux[aux.length - 1] += suma;
            }
        }

        return aux;
    };
    //obtengo la mascara de la red: 255.255.0.0
    const getnetMask = (mask) => {
        const aux = [];

        let suma = 128;
        for (let i = 0; i < 32; i++) {
            if (i % 8 === 0) {
                aux.push(0);
                suma = 128;
            } else
                suma = Math.ceil(suma / 2);

            if (mask > 0) {//i
                aux[aux.length - 1] += suma;//128 64 32 16 8 4 2 1=255
                mask -= 1;
            }
        }

        return aux;
    };
    const siguienteRed = (dir, salto) => {
        let aux = 0;

        for (let i = 3; i >= 0; i--) {
            if (i === 3) {
                dir[i] += salto;
            }

            dir[i] += aux;
            aux = Math.floor(dir[i] / 256);
            dir[i] %= 256;//se pasa de 256
        }

        return dir;
    };

    //obteniendo el arreglo de la direccion ip
    const getDirIp = (ip) => {
        let num = "";
        const dirIp = [];

        for (let aux of ip) {
            if (aux === ".") {//encuentro punto, solo encuentra 3
                dirIp.push(parseInt(num));
                num = "";
            } else {
                num += aux;
            }
        }

        dirIp.push(parseInt(num));
        return dirIp;
    }
    const buscarRed = () => {

        setBuscarBoton(prev=>!prev)
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
            <div className='container-form'>
                <form className='form' action='none'>
                    <input placeholder='Buscar' type='text' onChange={onFormUpdate} name='buscar' value={buscar} />
                    <button type='button' onClick={buscarRed}>Buscar</button>
                </form>
            </div>
            <ToastContainer />
            {validacion&&<Red noSubRedes={red.numSubRedes} noHost={red.hosts} clase={red.classIp} netmask={toString(red.netMask)} />}
            <div className='subredes'>
                {datos.length > 0 && (!buscarBoton) &&
                    datos.map((dato) => (
                        <SubRedes
                            i={dato.i}

                            dirRed={toString(dato.dirRed)}

                            minHost={toString(dato.minHost)}

                            maxHost={toString(dato.maxHost)}

                            broadcastArray={toString(dato.broadcastArray)}

                            salto={dato.salto - 2}
                        />

                    ))
                }
                {datos.length > 0 &&(buscarBoton&&buscar!="")&&
                    <SubRedes
                        i={datos[buscar-1].i}

                        dirRed={toString(datos[buscar-1].dirRed)}

                        minHost={toString(datos[buscar-1].minHost)}

                        maxHost={toString(datos[buscar-1].maxHost)}

                        broadcastArray={toString(datos[buscar-1].broadcastArray)}

                        salto={datos[buscar-1].salto - 2}
                    />
                }

            </div>
        </div>
    )
}
export default Form;