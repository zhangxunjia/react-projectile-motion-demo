import React, {
    useRef, useEffect, memo
} from 'react';
// import { ProjectileMotion } from 'react-projectile-motion';
import { ProjectileMotion } from 'src/components/ProjectileMotion';
// import Draggable from 'react-draggable'
import StartEndDom from '../StartEndDom'

const type = 'end'

const EndCom = (props) => {
    const {
        item,
        movingStatus,
        settingStatus,
        setProjectileMotionPorps,
        openEditModal,
        ...otherProps
    } = props

    const endingDom = useRef();

    useEffect(() => {
        if(!movingStatus) {
            setProjectileMotionPorps && setProjectileMotionPorps({
                ...item.projectileMotionPorps,
                endingDom: endingDom.current
            });
        }
    }, [
        item.projectileMotionPorps,
        movingStatus
    ]);

    const onDomClick = () => {
        // 设置状态下点击进行设置
        if(settingStatus) {
            openEditModal && openEditModal(item, type);
        }
    }

    return (
        <StartEndDom
            type={type}
            item={item}
            movingStatus={movingStatus}
            settingStatus={settingStatus}
            ref={endingDom}
            onClick={onDomClick}
            {...otherProps}
        />
    );
};

// 不引起组件更新的props
// Props that do not cause component updates
const filterKeyList = {
    openEditModal: true
};

export default memo(
    ProjectileMotion(EndCom),
    (prevProps, nextProps) => !Object.keys(prevProps)
        .filter((item) => !filterKeyList[item])
        .some((i) => prevProps[i] !== nextProps[i])
);
