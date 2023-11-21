import React, {
    useRef
} from 'react';
import { ProjectileMotionStarter } from 'src/components/ProjectileMotion';
// import { ProjectileMotionStarter } from 'react-projectile-motion';

const StartCom = (props) => {
    const {
        isRealoadVisible
    } = props

    const startingDom = useRef();

    return (
        <div
            className={`start-com start-com-${isRealoadVisible ? 'disabled' : 'active'} `}
            ref={startingDom}
            onClick={() => {
                !isRealoadVisible && props.triggerProjectileMotion('subscriptionName', startingDom.current);
            }}
        />
    );
};

export default ProjectileMotionStarter(StartCom);
