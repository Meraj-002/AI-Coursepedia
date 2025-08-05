import React from 'react';
import {PricingTable} from '@clerk/nextjs'
function billing() {
    return ( 
        <div>
            <h2 className='font-bold text-3xl mb-5'>Select Plan</h2>
            <PricingTable />
        </div>
     );
}

export default billing;