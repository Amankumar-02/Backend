import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Jokes() {
    const [jokesData, setJokesData] = useState([]);
    useEffect(()=>{
        try {
            ;(async()=>{
                const response = await axios.get("/api/jokes");
                console.log(response.data);
                setJokesData(response.data);
            })()
        } catch (error) {
            console.log(error)
        }
    }, [])

    if(jokesData.length===0){
        return(
            <>
            <h1>Loading...</h1>
            </>
        )
    }

  return (
    <>
    <h3>Jokes: {jokesData.length}</h3>
    <hr />
    <hr />
    {jokesData.map(({id, title, content})=>(
        <div key={id}>
            <h4>{title}</h4>
            <p>{content}</p>
            <hr />
        </div>
    ))}
    </>
  )
}

export default Jokes