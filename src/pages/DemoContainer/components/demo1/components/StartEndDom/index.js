import React, {
    forwardRef
} from 'react';
import Draggable from 'react-draggable'

const StartEndDom = forwardRef((props, ref) => {
    const {
        type,
        item,
        movingStatus,
        settingStatus,
        ...otherProps
    } = props

    return (
        <div
            style={{
                display: 'inline-block',
                cursor: movingStatus ? 'move' : 'pointer'
            }}
        >
            <Draggable
                disabled={!movingStatus}
            >
                <div
                    ref={ref}
                    className={`${type} ${settingStatus ? 'edit-status' : ''}`}
                    style={item.style}
                    {...otherProps}
                />
            </Draggable>
        </div>

    )
})

export default StartEndDom;