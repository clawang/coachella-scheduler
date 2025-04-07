import React from 'react';
import './style.scss';

export function Button({label, handleClick, children}: {
    label?: string,
    handleClick: (e: React.MouseEvent<HTMLElement>) => void,
    children: React.ReactNode,
}) {
    return (
        <div className="button" onClick={handleClick}>
            <a href="">{children}</a>
        </div>
    );
}