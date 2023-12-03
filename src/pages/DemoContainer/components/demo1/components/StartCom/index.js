import React, {
    memo,
    useRef
} from 'react';
import { withProjectileMotionStarter } from 'react-projectile-motion';
// import { withProjectileMotionStarter } from 'src/components/ProjectileMotion';
// import { withProjectileMotionStarter } from 'react-projectile-motion';
// import Draggable from 'react-draggable'
import StartEndDom from '../StartEndDom'

const type = 'start'

const StartCom = (props) => {
    const {
        item,
        movingStatus,
        settingStatus,
        triggerProjectileMotion,
        openEditModal,
        ...otherPorps
    } = props
    const startingDom = useRef();

    const onDomClick = () => {
        // 普通状态下点击触发动画
        if(!movingStatus && !settingStatus) {
            triggerProjectileMotion
            && item
            && item.projectileMotionPorps
            && triggerProjectileMotion(item.projectileMotionPorps.subscription, startingDom.current)
        // 设置状态下点击进行设置
        } else if(settingStatus) {
            openEditModal && openEditModal(item, type);
        }
    }

    return (
        <StartEndDom
            type={type}
            item={item}
            movingStatus={movingStatus}
            settingStatus={settingStatus}
            ref={startingDom}
            onClick={onDomClick}
            {...otherPorps}
        />
    );
};

// 不引起组件更新的props
// Props that do not cause component updates
const filterKeyList = {
    openEditModal: true
}

export default memo(
    withProjectileMotionStarter(StartCom),
    (prevProps, nextProps) => !Object.keys(prevProps)
        .filter((item) => !filterKeyList[item])
        .some((i) => prevProps[i] !== nextProps[i])
);