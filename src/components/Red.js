import React from 'react'

const Red = (props) => {
    return (
        <div className='red'>
            <section class="result" id="results">
            <div class="card">
                    <p>Número de Sub Redes</p>
                    <p id="noHosts">{props.noSubRedes}</p>
                </div>

                <div class="card">
                    <p>Número de hosts/net</p>
                    <p id="noHosts">{props.noHost}</p>
                </div>

                <div class="card">
                    <p>Clase</p>
                    <p id="class-result">{props.clase}</p>
                </div>

                <div class="card">
                    <p>Mascara</p>
                    <p id="netmask">{props.netmask}</p>
                </div>           

            </section>
            </div>
    )
}
export default Red;