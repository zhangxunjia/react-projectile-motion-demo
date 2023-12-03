import React, {
    useEffect, memo, useRef
} from 'react';

/**
 * 获取窗体可视区域到顶部的距离 - Distance from the top of the window's visible area
 * @returns {number} 窗体可视区域到顶部的距离 - Distance from the top of the window's visible area
 */
const visibleAreaToTop = () => window.pageYOffset - document.documentElement.clientTop


/**
 * 获取窗体可视区域到左侧的距离 - Distance from the left of the window's visible area
 * @returns {number} 窗体可视区域到左侧的距离 - Distance from the left of the window's visible area
 */
const visibleAreaToLeft = () => window.pageXOffset - document.documentElement.clientLeft


const ProjectileMovment = (props) => {
    const {
        startingDomBoundingClientRect,
        endingDom,
        projectileMovmentEnd,
        endingDomAnimationEnd,
        projectile,
        needEndingDomAnimation,
        duration = 1,
        endingDomAnimationDuration = 1,
        deleteProjectile,
        collectEndingDomAnimationEndList,
        isInitialYAxisReverse = true,
        newAnimationName,
        projectileTransition,
        windowResize,
        zIndex,
        restoreStyle,
        wrapClassName
    } = props;

    const projectileRef = useRef(null); // 抛物体的dom节点 - dom node of the projectile

    const trasitionEndHasCalled = useRef(false); // projectileTransitionEnd函数是否执行过 - Has the projectileTransitionEnd function been executed

    const windowResizeRecorder = useRef(null); // windowResize记录器 - windowResize recorder

    const motionStartTime = useRef(null); // 抛物动画开始时间 - Projectile animation start time

    useEffect(() => {
        move(startingDomBoundingClientRect, 'init');
    }, []);

    useEffect(() => {
        // 重置抛物体位置起始位置
        // Reset the starting position of the projectile
        if (
            windowResizeRecorder.current
            && windowResize
            && windowResizeRecorder.current !== windowResize
        ) {
            move(projectileRef.current.getBoundingClientRect(), 'resize')
        }
        // 记录上一次的windowResize
        // Record the last windowResize
        if(windowResizeRecorder.current !== windowResize) {
            windowResizeRecorder.current = windowResize;
        }
    }, [windowResize])

    // 平抛动画的transition
    // Transition of flat animation
    const flatProjectile = (duration) => `left ${duration}s cubic-bezier(.35,.8,1,1), top ${duration}s ease-in`

    // 获取startingPointRect的中心点距离顶部的距离
    // Get the distance from the center of the startingPointRect to the top
    const getstartingPointCenterPointTop = (startingPointRect) => startingPointRect.top + visibleAreaToTop() + startingPointRect.height / 2 - projectileRef.current.getBoundingClientRect().height / 2

    // 获取startingPointRect的中心点距离顶部的距离
    // Get the distance from the center of the startingPointRect to the top
    const getstartingPointCenterPointLeft = (startingPointRect) => startingPointRect.left + visibleAreaToLeft() + startingPointRect.width / 2 - projectileRef.current.getBoundingClientRect().left / 2

    // 获取endingDom的中心点距离顶部的距离
    // Get the distance from the center of the endingDom to the top
    const getEndingDomCenterPointTop = () => endingDom.getBoundingClientRect().top + visibleAreaToTop() + endingDom.getBoundingClientRect().height / 2 - projectileRef.current.getBoundingClientRect().height / 2

    // 获取endingDom的中心点距离左边的距离
    // Get the distance from the center of the endingDom to the left
    const getEndingDomCenterPointLeft = () => endingDom.getBoundingClientRect().left + visibleAreaToLeft() + endingDom.getBoundingClientRect().width / 2 - projectileRef.current.getBoundingClientRect().width / 2

    /**
     * 抛掷动画开始 - Projectile animation starts
     * @param {*} startingPointRect 开始点的dom的getBoundingClientRect()返回值 - getBoundingClientRect() return value of the starting point dom
     * @param {*} type 抛掷动画开始的类型  1.init初始抛掷  2.resize 屏幕缩放导致的抛掷  3.readjust 因抛掷动画endingDom移动导致终点错位而重新发起的抛掷 - Type of projectile animation start 1.init initial throw 2.resize screen scaling caused by the throw 3.readjust due to the displacement of the end point caused by the movement of the projectile animation endingDom Re-initiated projectile
    */
    const move = (startingPointRect, type) => {
        // 当前时间的时间戳
        // Timestamp of current time
        const time = new Date().getTime();
        // 抛掷动画剩余时间
        // Projectile animation remaining time
        let restTime;
        // 计算从动画开始到动画中段所用的时间
        // Calculate the time from the start of the animation to the middle of the animation
        const passedTime = (time - motionStartTime.current) / 1000;
        // 屏幕缩放导致的抛掷
        if(type === 'resize') {
            // 计算剩余时间 若剩余时间小于0则为0
            // Calculate the remaining time, if the remaining time is less than 0, it is 0
            const rest = duration - passedTime;
            restTime = rest > 0 ? rest : 0
        // 初始抛掷 + 因抛掷动画endingDom移动导致终点错位而重新发起的抛掷
        // Initial throw + re-initiated throw due to displacement of the end point caused by the movement of the projectile animation endingDom
        } else {
            motionStartTime.current = time;
            restTime = duration;
        }

        // 是否可进行抛物运动的判断
        // Judgment of whether projectile motion is possible
        if (
            startingPointRect
            && endingDom
            // 如果起始位置和终点位置在同一位置则不触发抛掷动画
            // If the starting position and the end point are in the same position, the projectile animation is not triggered
            && !(
                getstartingPointCenterPointTop(startingPointRect) === getEndingDomCenterPointTop()
                    && getstartingPointCenterPointLeft(startingPointRect) === getEndingDomCenterPointLeft()
            )
            && (
                ((
                    // 若为屏幕reszie事件所触发的抛掷动画，则需判断所剩的时间是否大于0，若小于等于0因其运动后不能触发onTransitionEnd事件，所以不可通过
                    // If it is a projectile animation triggered by a screen reszie event, it is necessary to judge whether the remaining time is greater than 0. If it is less than or equal to 0, it cannot be passed because the onTransitionEnd event cannot be triggered after its movement
                    type === 'resize'
                    && motionStartTime.current
                    && (restTime > 0)
                // 若为其他，则可通过
                // If it is other, it can be passed
                ) || type !== 'resize'
                )
            )
        ) {
            // 还原样式
            // Restore style
            projectileRef.current.style = {};
            // 起始位置
            // Starting position
            // 计算起始位置在起始的dom的中心距离
            // Calculate the starting position in the center of the starting dom
            projectileRef.current.style.top = `${getstartingPointCenterPointTop(startingPointRect)}px`;
            projectileRef.current.style.left = `${getstartingPointCenterPointLeft(startingPointRect)}px`;
            projectileRef.current.style.display = 'block';
            projectileRef.current.style.position = 'absolute';
            projectileRef.current.style.zIndex = zIndex;
            projectileRef.current.style.transform = 'translate(-50%, -50%)';

            // 终点位置
            // End position
            setTimeout(() => {
                projectileRef.current.style.transition =
                    type !== 'init'
                        // 抛掷动画执行到一半,因屏幕大小改变抛物动画仍未结束,需要重置以平抛为其轨迹使其终点不发生偏移 或者是 因抛掷动画endingDom移动导致终点错位而重新发起的平抛
                        // The projectile animation is executed halfway, because the screen size changes and the projectile animation is not over yet, it needs to be reset to a flat throw as its trajectory so that its end point does not shift or it is a flat throw that is re-initiated due to the displacement of the end point caused by the movement of the projectile animation endingDom
                        ?   flatProjectile(restTime)
                        // 抛物动画新的开始
                        // Projectile animation starts
                        :   projectileTransition
                            // 是否自定义抛掷物体的transition
                            // Whether to customize the transition of the projectile
                            ?   projectileTransition
                            :   isInitialYAxisReverse
                                // 初始Y轴为反方向抛
                                // Initial Y axis is up/down
                                ? `left ${restTime}s linear, top ${restTime}s cubic-bezier(.39,-1,1,0)`
                                // 平抛
                                // Flat
                                : flatProjectile(restTime);

                projectileRef.current.style.top = `${getEndingDomCenterPointTop()}px`;
                projectileRef.current.style.left = `${getEndingDomCenterPointLeft()}px`;
            }, 0);
        }
    };

    /**
     * endingDom被抛物体击中动画 - endingDom is hit by the projectile animation
     */
    const endingDomAnimate = () => {
        restoreStyle()
        // 设置endingDom被抛物体击中动画
        // Set endingDom to be hit by the projectile animation
        setTimeout(() => {
            endingDom.style.animation = newAnimationName;
            endingDom.style['animation-duration'] = `${endingDomAnimationDuration}s`;
            endingDom.style['animation-fill-mode'] = 'both';
        }, 0);
    };

    /**
     * 抛物动画结束 - Projectile animation ends
     * @param {object} event transitionend事件对象 - transitionend event object
     */
    const projectileTransitionEnd = () => {
        // 因transition设置的left和top时间是一样但其他不一样，这会导致transitionend事件会触发两次，所以这里做了防止同一事件触发两次的处理
        // Because the time set by transition is the same but others are different, this will cause the transitionend event to be triggered twice, so here is the processing to prevent the same event from being triggered twice
        if(!trasitionEndHasCalled.current) {
            // 判断抛掷物是否达到了目的点（若抛物运动过程中，endingDom位置发生了移动则终点位置不是目的点）- 此处的做法为将其目前位置作为起点，endingDom目前位置作为终点进行一次平抛
            // Determine whether the projectile has reached the destination point (if the endingDom position has changed during the projectile movement, the end point is not the destination point) - the current position is used as the starting point here, and the current position of endingDom is used as the end point for a flat throw
            const {
                top: projectileCenterPointTop,
                left: projectileCenterPointLeft,
                width,
                height
            } = projectileRef.current.getBoundingClientRect();
            // 因上面的样式使用了transform:translate(-50%, -50%)，所以这里需要加上width/2和height/2
            // Because the style above uses transform:translate(-50%, -50%), you need to add width/2 and height/2 here
            const projectileTop = projectileCenterPointTop + height / 2 + visibleAreaToTop();
            const projectileLeft = projectileCenterPointLeft + width / 2 + visibleAreaToLeft();
            // 是否在误差范围内，误差为1px
            // Whether it is within the error range, the error is 1px
            const errorRange = 1;
            const topWithinErrorRange = projectileTop <= getEndingDomCenterPointTop() + errorRange && projectileTop >= getEndingDomCenterPointTop() - errorRange;
            const leftWithinErrorRange = projectileLeft <= getEndingDomCenterPointLeft() + errorRange && projectileLeft >= getEndingDomCenterPointLeft() - errorRange;
            // 抛掷终点不是endingDom的位置
            // The end point of the projectile is not the position of endingDom
            if(!topWithinErrorRange || !leftWithinErrorRange) {
                move(projectileRef.current.getBoundingClientRect(), 'readjust');
            // 抛掷终点是endingDom的位置
            // The end point of the projectile is the position of endingDom
            } else {
                trasitionEndHasCalled.current = true
                deleteProjectile(props);
                if (typeof projectileMovmentEnd === 'function') {
                    projectileMovmentEnd();
                }
                if (typeof endingDomAnimationEnd === 'function') {
                    collectEndingDomAnimationEndList(props);
                }
                // 是否需要endom被抛物体击中动画
                // Whether to need endom is hit by the projectile animation
                if (needEndingDomAnimation) {
                    endingDomAnimate();
                }
            }
        }
    };

    return (
        <div
            className={wrapClassName}
            style={{
                display:'none'
            }}
            ref={projectileRef}
            onTransitionEnd={projectileTransitionEnd}
        >
            {projectile}
        </div>
    );
};

// 不引起组件更新的props
// Props that do not cause component updates
const filterKeyList = {
    deleteProjectile: true,
    collectEndingDomAnimationEndList: true,
    restoreStyle: true
};

export default memo(
    ProjectileMovment,
    (prevProps, nextProps) => !Object.keys(prevProps)
        .filter((item) => !filterKeyList[item])
        .some((i) => prevProps[i] !== nextProps[i])
);
