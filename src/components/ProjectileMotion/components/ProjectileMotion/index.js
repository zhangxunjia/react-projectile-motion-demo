import React, {
    useEffect, memo, useReducer, useRef, forwardRef, useCallback
} from 'react';
import ReactDOM from 'react-dom';
import pubsub from 'pubsub-js';
import ProjectileMovment from './components/ProjectileMovment';
import { debounce, uuid } from '../../tools/utils';

/**
 * @param {object} props
 * @param {string} props.subscription - 必传 pubsub订阅名称 - required. pubsub subscription name
 * @param {object} props.endingDom - 必传 抛掷物结束位置的dom - required. The dom at the end of the projectile
 * @param {boolean} props.muiltipleProjectile - 是否允许出现多个抛掷物 默认为true - Whether multiple projectiles are allowed, the default is true
 * @param {ReactNode} props.projectile - 抛掷物（如果要添加className需把样式写在全局） - Projectile (if you want to add className, you need to write the style globally)
 * @param {number} props.duration - 抛掷动画持续的时间 - The duration of the projectile animation
 * @param {number} props.zIndex - 设置抛掷物的zIndex 默认为2147483647 - Set the zIndex of the projectile, the default is 2147483647
 * @param {boolean} props.needEndingDomAnimation - endingDom是否需要被抛掷物击中后动画 默认为true - Whether endingDom needs to be animated after being hit by the projectile
 * @param {function} props.projectileMovmentEnd - 抛物运动动画结束回调 - Projectile motion animation end callback
 * @param {function} props.endingDomAnimationEnd - endingDom动画结束回调 - endingDom animation end callback
 * @param {number} props.endingDomAnimationDuration - endingDom被抛掷物击中后动画持续时间 - The duration of the animation after endingDom is hit by the projectile
 * @param {string} props.endingDomAnimationName - endingDom被抛掷物击中后的animation的名称（animation需在全局）- The name of the animation after endingDom is hit by the projectile (animation needs to be global)
 * @param {string} props.additionalTransformValueInAnimate - 补充的动画的transform值，传入该值后会生成新的类名，该类会整合endingDomAnimationName对应的keyframe除最后一帧外的其他帧，形成新的类，然后供endingDom应用。可以设置rotate scale translate skew 等值，若设置多个请用空格隔开 - Additional animation transform value, after passing in this value, a new class name will be generated, which will integrate all the frames of the keyframe corresponding to endingDomAnimationName except the last frame, forming a new class, and then apply it to endingDom. You can set rotate scale translate skew and other values, if you set multiple, please use spaces to separate
 * @param {string} props.wrapClassName - 抛掷物外层容器的类名 默认为null - The class name of the outer container of the projectile, the default is null
 * @param {boolean} props.isInitialYAxisReverse - 抛物运动初速度y轴方向是否为反方向 默认为true - Whether the initial velocity of the projectile motion in the y-axis direction is in the opposite direction, the default is true
 * @param {string} props.projectileTransition - 自定义抛掷物的transition属性若传入此属性则duration和isInitialYAxisReverse将失效 默认为null - Custom projectile transition properties. If this property is passed in, duration and isInitialYAxisReverse will be invalid. The default is null
 */
const MotionEntity = (props) => {
    const {
        endingDom,
        subscription = '',
        muiltipleProjectile = true,
        endingDomAnimationName,
        resetSetting,
        additionalTransformValueInAnimate = '',
        projectile = (
            <div
                style={{
                    background:'red',
                    width:'15px',
                    height:'15px',
                    borderRadius:'50%'
                }}
            />
        ),
        needEndingDomAnimation = true,
        zIndex = 2147483647,
        wrapClassName
    } = props;

    const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), {
        goMove: 0, // 抛掷物是否显示 - whether the projectile is displayed
        startingDomBoundingClientRect: null, // 触发subscribe时抛掷物起始位置 - starting position of the projectile when triggering subscribe
        projectileList: [], // 抛掷物数组 - projectile array
        endingDomDefaultSetting: {}, // endingDom默认属性 - endingDom default setting
        endingDomAnimationEndList: [], // 收集endingDomAnimationEnd函数的数组 - Array of endingDomAnimationEnd functions
        lastKeyframes: null, // 上一次的keyframes值 - last keyframes value
        lastOriginalTransform: null, // 上一次的transform值 - last transform value
        newAnimationName: null, // 动态生成的新的类名 或 直接引用传入的类名 - Dynamically generated new class name or directly referenced incoming class name
        lastAnimationIndex: null, // 动态生成的新的类名的索引 - index of dynamically generated new class name
        windowResize: 1 // 浏览器窗口变化 - browser window change
    });

    const projectileRef = useRef([]); // 抛掷物数组 - projectile array

    const {
        goMove,
        startingDomBoundingClientRect,
        projectileList,
        endingDomDefaultSetting,
        lastKeyframes,
        lastOriginalTransform,
        newAnimationName,
        lastAnimationIndex,
        windowResize
    } = state;

    const endingDomAnimationEndListRef = useRef([]);

    useEffect(() => {
        // 保存endingDom的默认属性
        // Save the default properties of endingDom
        if (endingDom) {
            dispatch({
                endingDomDefaultSetting: {
                    style: JSON.parse(JSON.stringify(endingDom.style)),
                    ontransitionend: JSON.parse(JSON.stringify(endingDom.ontransitionend))
                }
            });
            if(endingDomAnimationName && needEndingDomAnimation) {
                // 动态生成新的类名
                // Dynamically generate new class names
                if(
                    // 是否有additionalTransformValueInAnimate
                    additionalTransformValueInAnimate
                    // endingDom的transform是否已经设置了值，如果设置了值则生成新类名，使其动画携带原有的transform而不是动画中的transform直接覆盖
                    // Whether the transform of endingDom has been set. If the transform has been set, a new class name is generated to make the animation carry the original transform instead of the transform in the animation directly overwriting
                    || window.getComputedStyle(endingDom).getPropertyValue('transform') !== 'matrix(1, 0, 0, 1, 0, 0)'
                ) {
                    generateNewClass();
                // 直接引用传入的类名
                // Directly reference the incoming class name
                } else {
                    dispatch({
                        newAnimationName:endingDomAnimationName
                    });
                }
            }
        }
    }, [resetSetting]);


    // 添加抛掷物
    // Add projectile
    useEffect(() => {
        if(goMove === 0) return;
        const newProjectile = {
            ...props,
            id: goMove,
            startingDomBoundingClientRect
        };
        // 是否允许出现多个抛掷物
        // Whether multiple projectiles are allowed
        projectileRef.current = muiltipleProjectile
            // 允许出现多个抛掷物时，把新的抛掷物添加到数组中
            // When multiple projectiles are allowed, add the new projectile to the array
            ? [
                ...projectileList,
                newProjectile
            ]
            // 不允许出现多个抛掷物则对数组进行替换
            // If multiple projectiles are not allowed, replace the array
            : [newProjectile];
        dispatch({
            projectileList: projectileRef.current
        });
    }, [goMove]);

    useEffect(() => {
        const sub = pubsub.subscribe(
            subscription,
            // startingDomBoundingClientRect 起始用dom.getBoundingClientRect()方法获取的值，而endingDom是通过传入dom，是因为pubsub.publish是异步的，当开始处理pubsub.subscribe里面的函数时可能endingDom的状态可能已经不是最开始调用的状态了，（可能已经消失了，或者移位了，比如点击drawer的取消触发时，drawer整个组件包括取消按钮都要跟着消失）
            // startingDomBoundingClientRect is the value obtained by dom.getBoundingClientRect() method, and endingDom is passed in dom, because pubsub.publish is asynchronous, when starting to process the function in pubsub.subscribe, the status of endingDom may not be the status of the initial call (may have disappeared, or moved, such as clicking the cancel button of the drawer to trigger, the entire drawer component including the cancel button should disappear)
            (msg, { startingDomBoundingClientRect }) => {
                dispatch({
                    goMove: goMove + 1,
                    startingDomBoundingClientRect
                });
            }
        );

        return () => {
            pubsub.unsubscribe(sub);
        };
    }, [subscription, goMove]);

    /**
     * 窗口变化触发函数 - Window change trigger function
     */
    const onResize = useCallback(debounce(() => {
        dispatch({
            windowResize: windowResize + 1
        });
    }, 100, false))

    // 监听窗口变化
    // Listen for window changes
    useEffect(() => {
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, [windowResize])

    /**
     * endingDom动画结束事件回调 - endingDom animation end event callback
     */
    const onEndingDomAnimationEnd = () => {
        restoreStyle()
        executeEndingDomAnimationEndList();
    }

    // 新增对endingDom动画结束事件的监听
    // Add a listener for the endingDom animation end event
    useEffect(() => {
        if(endingDom) {
            endingDom.addEventListener('animationend', onEndingDomAnimationEnd);
            return () => {
                endingDom.removeEventListener('animationend', onEndingDomAnimationEnd);
            }
        }
    }, [resetSetting])

    /**
     * 删除抛掷物 - Delete projectile
     * @param {object} projectileItem - 抛掷物对象 - projectile object
     */
    const deleteProjectile = (projectileItem) => {
        const { id } = projectileItem;
        if (id) {
            projectileRef.current = projectileRef.current.filter((item) => item.id !== id);
            dispatch({
                projectileList: projectileRef.current
            });
        }
    };

    /**
     * 收集endingDomAnimationEnd函数到EndingDomAnimationEndList - Collect endingDomAnimationEnd functions to EndingDomAnimationEndList
     * @param {*} projectileItem - 抛掷物对象 - projectile object
     */
    const collectEndingDomAnimationEndList = (projectileItem) => {
        const { endingDomAnimationEnd } = projectileItem
        endingDomAnimationEndListRef.current = [
            ...endingDomAnimationEndListRef.current,
            endingDomAnimationEnd
        ];
        dispatch({
            endingDomAnimationEndList: endingDomAnimationEndListRef.current
        });
    };


    /**
     * 执行EndingDomAnimationEndList里面收集endingDomAnimationEnd函数 - Execute the endingDomAnimationEnd function collected in EndingDomAnimationEndList
     */
    const executeEndingDomAnimationEndList = () => {
        endingDomAnimationEndListRef.current.forEach((endingDomAnimationEnd) => {
            if (typeof endingDomAnimationEnd === 'function') {
                endingDomAnimationEnd();
            }
        });
        endingDomAnimationEndListRef.current = [];
        dispatch({
            endingDomAnimationEndList: endingDomAnimationEndListRef.current
        });
    };

    /**
     * 动态生成新的类名 - Dynamically generate new class names
     */
    const generateNewClass = () => {
        // 目标样式表
        // Target style sheet
        let targetStyleSheet;
        // 新的 CSS 规则
        // New CSS rules
        let newRule;

        // 获取样式表中的所有规则
        // Get all rules in the style sheet
        const styleSheets = document.styleSheets;

        // 遍历样式表
        // Traverse the style sheet
        for (let i = 0; i < styleSheets.length; i++) {
            const styleSheet = styleSheets[i];
            // 找到包含projectile-motion-react的样式表
            // Find the style sheet containing react-projectile-motion
            if(styleSheet.title && styleSheet.title.includes('react-projectile-motion')) {
                targetStyleSheet = styleSheet;
                continue;
            }

            // 遍历样式表中的规则
            // Traverse the rules in the style sheet
            for (let j = 0; j < styleSheet.cssRules.length; j++) {
                const rule = styleSheet.cssRules[j];
                // 检查是否是 @keyframes 规则并且名称匹配
                // Check if it is a @keyframes rule and the name matches
                if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === endingDomAnimationName) {
                    // 获取关键帧规则
                    // Get keyframe rules
                    const keyframes = rule.cssRules;

                    // 获取元素原有的 transform 属性值 若为none则设为空字符串
                    // Get the original transform attribute value of the element
                    const endingDomTransformComputedStyle = window.getComputedStyle(endingDom).getPropertyValue('transform');
                    const originalTransform = endingDomTransformComputedStyle !== 'none' ? endingDomTransformComputedStyle : '';

                    // 对比上一次的keyframes值和transform值，若不同则创建新的动画类名
                    // Compare the last keyframes value and transform value, if different, create a new animation class name
                    if(keyframes !== lastKeyframes || originalTransform !== lastOriginalTransform) {
                        const newAnimationName = `react-projectile-motion-${uuid()}`
                        const keyframesList = Array.from(keyframes)
                        // 找出最后一帧的keyText值
                        // Find the keyText value of the last frame
                        let lastKeyText = ''
                        let tempKeyMax = -1
                        // 从后往前遍历keyframesList
                        // Traverse keyframesList from back to front
                        for(let i = keyframesList.length - 1 ; i > 0 ; i--) {
                            const keyText = keyframesList[i].keyText
                            // 如果该帧是100%那就终止遍历，100%就是最后一帧
                            // If the frame is 100%, the traversal is terminated, and 100% is the last frame
                            if(keyText === '100%') {
                                lastKeyText = keyText
                                break
                            }
                            // 如果该帧不是100%那就继续往前遍历,直至找到最大的keyText
                            // If the frame is not 100%, continue to traverse forward until you find the largest keyText
                            if(parseInt(keyText) > tempKeyMax) {
                                lastKeyText = keyText
                                tempKeyMax = parseInt(keyText)
                            }
                        }

                        // 合并原有的 keyframes  和动画的 keyframes
                        // Merge the original keyframes and the keyframes of the animation
                        const newkeyframes = keyframesList.map((keyframe) => {
                            const cssTextObj = {};
                            let hasTransform = false;
                            // 除了最后一个keyframe，其他的keyframe都要添加scale属性
                            // Except for the last keyframe, all other keyframes must add the scale attribute
                            let additionalTransformValue = keyframe.keyText === lastKeyText
                                ?   ''
                                :   additionalTransformValueInAnimate
                            const transformBaseValue = `${originalTransform} ${additionalTransformValue}`
                            for( let i = 0; i < keyframe.style.length; i++ ) {
                                const propName = keyframe.style[i];
                                // 将动画的transform属性与原有的transform属性合并, 其他属性不变
                                // Merge the transform attribute of the animation with the original transform attribute, and other attributes remain unchanged
                                if(propName === 'transform') {
                                    hasTransform = true;
                                    cssTextObj[propName] = `${transformBaseValue} ${keyframe.style[propName]} `;
                                } else {
                                    cssTextObj[propName] = keyframe.style[propName];
                                }
                            }
                            // 动画的 keyframes没有transform属性时，添加原有的transform属性
                            // When the animation's keyframes do not have the transform attribute, add the original transform attribute
                            if(!hasTransform) {
                                cssTextObj.transform = transformBaseValue;
                            }
                            return `
                                ${keyframe.keyText} {
                                    ${Object.keys(cssTextObj).map((key) => `${key}: ${cssTextObj[key]};`).join('')}
                                }
                            `
                        });

                        // 创建新的 CSS 规则，将动画应用于新的类名
                        // Create a new CSS rule and apply the animation to the new class name
                        newRule = `@keyframes ${newAnimationName} {
                            ${newkeyframes.join(' ')}
                        }`;

                        dispatch({
                            lastKeyframes: keyframes,
                            lastOriginalTransform: originalTransform,
                            newAnimationName
                        });
                    }
                }
            }
        }

        // 插入新规则到样式表
        // Insert new rules into the style sheet
        if(newRule) {
            // 若样式表中存在projectile-motion-react的样式表，则添加 / 插入 新的 CSS 规则到样式表
            // If the style sheet contains the style sheet of react-projectile-motion, add / insert new CSS rules to the style sheet
            if(targetStyleSheet) {
                // 添加 / 插入 新的 CSS 规则到样式表
                // Add / insert new CSS rules to the style sheet
                if (targetStyleSheet.insertRule) {
                    const animationIndex = lastAnimationIndex ? lastAnimationIndex : targetStyleSheet.cssRules.length;
                    targetStyleSheet.insertRule(newRule, animationIndex);
                    dispatch({
                        lastAnimationIndex: animationIndex
                    });
                } else if (targetStyleSheet.addRule) {
                    const animationIndex = lastAnimationIndex ? lastAnimationIndex : targetStyleSheet.rules.length
                    targetStyleSheet.addRule(newRule, animationIndex);
                    dispatch({
                        lastAnimationIndex: animationIndex
                    });
                }
            // 若样式表中不存在projectile-motion-react的样式表，则创建新的 style 标签
            // If the style sheet does not contain the style sheet of react-projectile-motion, create a new style tag
            } else {
                // 创建新的 style 标签
                // Create a new style tag
                const styleElement = document.createElement('style');
                styleElement.type = 'text/css';
                styleElement.title = 'react-projectile-motion';
                styleElement.innerHTML = newRule;
                document.head.appendChild(styleElement)
                dispatch({
                    lastAnimationIndex: 0
                });
            }
        }
    }

    /**
     * 复原endingDom样式及相关属性 - Restore endingDom style and related properties
     */
    const restoreStyle = () => {
        const {
            style = {}
        } = endingDomDefaultSetting;
        const {
            animation,
            'animation-duration': animationDuration,
            'animation-fill-mode': animationFillMode
        } = style;
        endingDom.style.animation = animation;
        endingDom.style['animation-duration'] = animationDuration;
        endingDom.style['animation-fill-mode'] = animationFillMode;
    }

    // 渲染到body标签下
    // Rendered under the body label
    return ReactDOM.createPortal(
        projectileList.map((item) => (
            <ProjectileMovment
                key={item.id}
                newAnimationName={newAnimationName}
                deleteProjectile={deleteProjectile}
                needEndingDomAnimation={needEndingDomAnimation}
                collectEndingDomAnimationEndList={collectEndingDomAnimationEndList}
                projectile={projectile}
                windowResize={windowResize}
                zIndex={zIndex}
                resetSetting={resetSetting}
                restoreStyle={restoreStyle}
                wrapClassName={wrapClassName}
                {...item}
            />
        )),
        document.body
    );
};

/**
 * 高阶组件,通过此组件包裹的组件的props接收到的setProjectileMotionPorps函数可用于设置抛物运动属性
 * A higher-order component, through which the wrapped component's props receive the setProjectileMotionPorps function that can be used to set the projectile motion properties
 */
const ProjectileMotion = (component) => {
    // 不引起组件更新的props
    // Props that do not cause component updates
    const filterKeyList = {
        setProjectileMotionPorps: true
    };
    const WrappedComponent = memo(
        component,
        (prevProps, nextProps) => !Object.keys(prevProps)
            .filter((item) => !filterKeyList[item])
            .some((i) => prevProps[i] !== nextProps[i])
    );

    const ProjectileMotion = memo(forwardRef((props, ref) => {
        const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), {
            projectileMotionPorps: {}, // ProjectileMotion的props - ProjectileMotion props
            resetSetting: 0 // 重置设置计数器 - reset setting counter
        });

        const {
            projectileMotionPorps,
            resetSetting
        } = state;

        const setProjectileMotionPorps = (projectileMotionPorps) =>  {
            dispatch({
                projectileMotionPorps,
                resetSetting: resetSetting + 1
            })
        }

        return (
            <>
                <MotionEntity
                    {...projectileMotionPorps}
                    resetSetting={resetSetting}
                />
                <WrappedComponent
                    {...props}
                    ref={ref}
                    setProjectileMotionPorps={setProjectileMotionPorps}
                />
            </>
        );
    }));

    return ProjectileMotion;
};

export default ProjectileMotion;
