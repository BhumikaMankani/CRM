import React, { useState } from 'react';
import md5 from 'md5';

const Md5Hasher = () => {
    const [hashedValue, setHashedValue] = useState('');
    const [valueToHash, setValueToHash] = useState('');

    const generateHash = () => {
        const input = 'komal@123'; // Use the string directly
        const hash = md5(input).toString();
        setValueToHash(input);
        setHashedValue(hash);
    };

    return (
        <div>
            <h2>MD5 Hash Generator</h2>
            <button onClick={generateHash}>Generate MD5</button>
            {hashedValue && (
                <p>
                    <strong>MD5 Hash:</strong> <code>{valueToHash} {hashedValue}</code>
                </p>
            )}
        </div>
    );
};

export default Md5Hasher;
