import React from 'react';
import './style.scss';

export function Button({ label, handleClick, children }: {
    label?: string,
    handleClick?: (e: React.MouseEvent<HTMLElement>) => void,
    children: React.ReactNode,
}) {
    return (
        <div className="button" onClick={handleClick}>
            <a href="">{children}</a>
        </div>
    );
}

export function GoingButton({ going, handleClick, handleNotGoingClick }: {
    going: boolean,
    handleClick: (e: React.MouseEvent<HTMLElement>) => void,
    handleNotGoingClick: (e: React.MouseEvent<HTMLElement>) => void,
}) {
    const [open, setOpen] = React.useState(false);

    const onButtonClick = (e: React.MouseEvent<HTMLElement>) => {
        if (going) {
            setOpen(!open);
        } else {
            handleClick(e);
        }
    }

    const onNotGoingClick = (e: React.MouseEvent<HTMLElement>) => {
        setOpen(false);
        handleNotGoingClick(e);
    }

    return (
        <div className="going-button">
            <button onClick={onButtonClick}>
                {"✓ Going" + (going ? " ∨" : "")}
            </button>
            {
                going && open &&
                <div className="going-button-dropdown">
                    <div className="going-button-dropdown-item" onClick={onNotGoingClick}>
                        Not going
                    </div>
                    <div className="going-button-dropdown-item">
                        Add note
                    </div>
                </div>
            }
        </div>
    );
}