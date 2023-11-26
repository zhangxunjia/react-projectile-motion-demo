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
        imgMap,
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
                <img
                    src={imgMap[type].src}
                    alt="图片加载失败"
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