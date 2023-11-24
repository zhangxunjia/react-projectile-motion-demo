import React, {
    useRef, useReducer, useEffect
} from 'react';
import { ProjectileMotionStarter } from 'src/components/ProjectileMotion';
// import { ProjectileMotionStarter } from 'react-projectile-motion';

const initialState = {
    isStickAnimatePlaying:false,
    dogGetHitted:false
}

const StartCom = (props) => {
    const {
        isRealoadVisible
    } = props

    const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), initialState);

    const {
        isStickAnimatePlaying,
        dogGetHitted
    } = state

    const startingDom = useRef();

    // 默认状态的狗子被点击
    const triggerAnimation = () => {
        if(!isRealoadVisible) {
            dispatch({
                isStickAnimatePlaying: true
            })
        }
    }

    // 当重新加载按钮可见的时候，所有状态复原
    useEffect(() => {
        if(isRealoadVisible) {
            const { isStickAnimatePlaying, dogGetHitted } = initialState
            dispatch({
                isStickAnimatePlaying,
                dogGetHitted
            })
        }
    }, [isRealoadVisible])

    // 当棍子动画开始的时候狗子大概300ms后被击中
    useEffect(() => {
        if(isStickAnimatePlaying) {
            setTimeout(() => {
                dispatch({
                    dogGetHitted: true
                })
            }, 300);
        }
    }, [isStickAnimatePlaying])

    // 当狗子被击中的时候，触发抛物动画
    useEffect(() => {
        if(dogGetHitted) {
            props.triggerProjectileMotion('subscriptionName', startingDom.current)
        }
    }, [dogGetHitted])

    return (
        <div
            className="start-com"
        >
            {/* 棍子 */}
            <div
                className={`
                    stick 
                    ${isStickAnimatePlaying ? 'stick-active' : ''}
                `}
            />
            {/* 狗子 */}
            <div
                ref={startingDom}
                className={`
                    dog
                    ${isRealoadVisible || dogGetHitted ? 'dog-inactive' : ''}
                `}
                onClick={triggerAnimation}
            />
            {/* bang */}
            <div
                className={`
                    bang
                    ${dogGetHitted ? 'bang-active' : ''}
                `}
            />
        </div>
    );
};

export default ProjectileMotionStarter(StartCom);
