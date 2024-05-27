import React from 'react'

const SubRedes = (props) => {
    return (
        <div className='red subRed'>
            <section class="result" id="results">
                <div class="subnet-title">Subred {props.i} </div>
                <div class="card">
                    <p>Dirección de red</p>
                    <p>{props.networkAddress}</p>
                </div>

                <div class="card">
                    <p>Host mínimo</p>
                    <p>{props.minHostArray}</p>
                </div>

                <div class="card">
                    <p>Host máximo</p>
                    <p>{props.maxHostArray}</p>
                </div>

                <div class="card">
                    <p>Broadcast</p>
                    <p>{props.broadcastArray}</p>
                </div>

                <div class="card">
                    <p>Hosts por red</p>
                    <p>{props.delta}</p>
                </div>

            </section>
        </div>
    )
}
export default SubRedes;