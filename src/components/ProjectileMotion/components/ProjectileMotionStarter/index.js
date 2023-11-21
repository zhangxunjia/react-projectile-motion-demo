import React, {
    useEffect, useReducer, memo, forwardRef
} from 'react';
import pubsub from 'pubsub-js';

/**
 * 高阶组件,通过此组件包裹的组件的props接收到的triggerProjectileMotion函数可用于触发抛掷物运动
 * A higher-order component, through which the wrapped component's props receive the triggerProjectileMotion function that can be used to initiate projectile motion
 */
const ProjectileMotionStarter = (WrappedComponent) => {
    const ProjectileMotionStarter = memo(forwardRef((props, ref) => {
        const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), {
            goMove: 0, // 运动计数器 - moving counter
            startingDom: null, // 起始dom - dom for starting
            subscriptionName: '' // pubsub订阅名称 - subscriptionName for pubsub
        });

        const {
            goMove,
            startingDom,
            subscriptionName
        } = state;

        useEffect(() => {
            // 获取触发subscribe时 startingDom 的页面坐标
            // Obtain the page coordinates of the startingDom when triggering the subscribe.
            if (subscriptionName && startingDom && startingDom.getBoundingClientRect()) {
                pubsub.publish(subscriptionName, {
                    startingDomBoundingClientRect: startingDom.getBoundingClientRect()
                });
            }
        }, [goMove]);

        /**
         * 运动开始的触发函数 - Trigger function for the start of motion
         * @param {*} subscriptionName 订阅名称 - subscriptionName for pubsub
         * @param {*} startingDom 运动起始位置所对应的dom - dom for starting
         */
        const triggerProjectileMotion = (subscriptionName, startingDom) => {
            dispatch({
                goMove: goMove + 1,
                subscriptionName,
                startingDom
            });
        };

        return (
            <WrappedComponent
                {...props}
                ref={ref}
                triggerProjectileMotion={triggerProjectileMotion}
            />
        );
    }));

    return ProjectileMotionStarter;
};

export default ProjectileMotionStarter;
