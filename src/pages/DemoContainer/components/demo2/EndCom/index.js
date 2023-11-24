import { FloatButton } from 'antd';
import React, {
    useRef, useEffect
} from 'react';
import { ProjectileMotion } from 'src/components/ProjectileMotion';
// import { ProjectileMotion } from 'react-projectile-motion';
import { ReloadOutlined } from '@ant-design/icons'

const projectileImgSrc = require('src/assets/images/dog1.png');
const growUpImgSrc = require('src/assets/images/dog2.png');
const binIcon = require('src/assets/images/bin.ico')

// 图片预加载，该js被引入的时候就会执行，后续引入图片的时候就会通过强缓存拿到图片
const imgDom = new Image();
imgDom.src = projectileImgSrc;


const EndCom = (props) => {
    const {
        isRealoadVisible,
        setIsRealoadVisible
    } = props

    const endingDom = useRef();
    const dogGrowUp = useRef();

    const endingDomOriginalStyle = useRef();
    const dogGrowUpOriginalStyle = useRef();

    // 动画结束
    const endingDomAnimationEnd = () => {
        if(setIsRealoadVisible && !endingDomOriginalStyle.current && !dogGrowUpOriginalStyle.current) {
            endingDomOriginalStyle.current = JSON.parse(JSON.stringify(endingDom.current.style))
            dogGrowUpOriginalStyle.current = JSON.parse(JSON.stringify(dogGrowUp.current.style))
            setIsRealoadVisible(true)
            endingDom.current.style.opacity = 0;
            endingDom.current.style.width = '0';
            dogGrowUp.current.style.opacity = 1;
            dogGrowUp.current.style.width = '40%';
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
            projectile: (
                <img
                    className="dog-small"
                    alt="dog1"
                    src={projectileImgSrc}
                />
            ),
            endingDomAnimationEnd
        });
    }, []);

    return (
        <>
            <img
                className="ending-bin"
                ref={endingDom}
                src={binIcon}
                alt="binIcon"
            />
            <img
                ref={dogGrowUp}
                src={growUpImgSrc}
                className="dog-grow-up"
                alt="dogGrowUp"
            />
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
