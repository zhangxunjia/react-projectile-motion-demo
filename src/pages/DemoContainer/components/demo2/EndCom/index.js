import { FloatButton } from 'antd';
import React, {
    useRef, useEffect
} from 'react';
import { ProjectileMotion } from 'src/components/ProjectileMotion';
// import { ProjectileMotion } from 'react-projectile-motion';
import { ReloadOutlined } from '@ant-design/icons'
import { isRender } from 'src/tools/utils';

const EndCom = (props) => {
    const {
        isRealoadVisible,
        setIsRealoadVisible,
        imgList
    } = props

    const endingDom = useRef();
    const dogGrowUp = useRef();

    const endingDomOriginalStyle = useRef();
    const dogGrowUpOriginalStyle = useRef();

    // 动画结束
    const endingDomAnimationEnd = () => {
        // 是否为移动端
        const isMobile = /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);
        if(setIsRealoadVisible && !endingDomOriginalStyle.current && !dogGrowUpOriginalStyle.current) {
            endingDomOriginalStyle.current = JSON.parse(JSON.stringify(endingDom.current.style))
            dogGrowUpOriginalStyle.current = JSON.parse(JSON.stringify(dogGrowUp.current.style))
            setIsRealoadVisible(true)
            endingDom.current.style.opacity = 0;
            endingDom.current.style.width = '0';
            dogGrowUp.current.style.opacity = 1;
            dogGrowUp.current.style.width = isMobile ? '60%' : '30%';
        }
    };

    // 复原
    const reload = () => {
        endingDom.current.style.opacity = endingDomOriginalStyle.current.opacity;
        endingDom.current.style.width = endingDomOriginalStyle.current.width;
        dogGrowUp.current.style.opacity = dogGrowUpOriginalStyle.current.opacity;
        dogGrowUp.current.style.width = dogGrowUpOriginalStyle.current.width;
        setIsRealoadVisible(false)
        endingDomOriginalStyle.current = null
        dogGrowUpOriginalStyle.current = null
    }

    useEffect(() => {
        props.setProjectileMotionPorps({
            subscription: 'subscriptionName',
            endingDom: endingDom.current,
            endingDomAnimationName:'swing',
            additionalTransformValueInAnimate: 'scale(1.5)',
            duration: 1,
            projectile: isRender(imgList, 1) && (
                <img
                    className="dog-small"
                    alt="dog-small"
                    src={imgList[1].src}
                />
            ),
            endingDomAnimationEnd
        });
    }, [imgList]);

    return (
        <>
            {
                isRender(imgList, 3) && (
                    <img
                        className="ending-bin"
                        ref={endingDom}
                        src={imgList[3].src}
                        alt="binIcon"
                    />
                )
            }
            {
                isRender(imgList, 4) && (
                    <img
                        ref={dogGrowUp}
                        src={imgList[4].src}
                        className="dog-grow-up"
                        alt="dogGrowUp"
                    />
                )
            }
            {
                isRealoadVisible && (
                    <FloatButton
                        icon={<ReloadOutlined />}
                        onClick={reload}
                    />
                )
            }
        </>
    );
};

export default ProjectileMotion(EndCom);
