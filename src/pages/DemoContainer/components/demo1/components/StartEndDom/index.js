import React, {
    forwardRef
} from 'react';
import Draggable from 'react-draggable'
import { useTranslation } from 'react-i18next';
import { loadImageFailedTips } from 'src/data/constant';

const StartEndDom = forwardRef((props, ref) => {
    const {
        type,
        item,
        movingStatus,
        settingStatus,
        imgMap,
        ...otherProps
    } = props
    const { t } = useTranslation();

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
                    alt={t(loadImageFailedTips)}
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