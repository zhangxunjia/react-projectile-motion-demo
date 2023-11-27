import React, {
    useEffect, useReducer
} from 'react';
// import { ProjectileMotionStarter, ProjectileMotion } from 'src/components/ProjectileMotion';
import EndCom from './EndCom';
import StartCom from './StartCom';
import DemoWrapper from 'src/components/DemoWrapper';
import { getImage } from 'src/tools/axios';
import './index.scss';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { loadImageFailedTips } from 'src/data/constant';

const initialState = {
    // 重新加载按钮是否可见
    isRealoadVisible:false,
    // 是否正在加载图片
    loading: false,
    // 图片列表
    imgList: [
        // 前三个是start-com所需的图片
        {
            url: require('src/assets/images/stick.png'),
            src:''
        },
        {
            url: require('src/assets/images/dog-small.png'),
            src:''
        },
        {
            url: require('src/assets/images/bang.png'),
            src:''
        },
        // 后两个是end-com所需的图片
        {
            url: require('src/assets/images/bin.ico'),
            src:''
        },
        {
            url: require('src/assets/images/dog-grow-up.png'),
            src:''
        }
    ]
}

const Test = () => {
    const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), initialState);

    const {
        isRealoadVisible,
        loading,
        imgList
    } = state

    const { t } = useTranslation();

    // 设置重新加载按钮是否可见
    const setIsRealoadVisible = (isRealoadVisible) => {
        dispatch({
            isRealoadVisible
        })
    }

    // 加载本demo所需图片
    const loadImages = () => {
        dispatch({
            loading: true
        })
        Promise.all(imgList.map((img) => getImage(img.url)))
            .then((resList) => {
                dispatch({
                    imgList: state.imgList.map((item, index) => ({
                        ...item,
                        src: resList[index]
                    }))
                })
            })
            .catch(() => message.error(t(loadImageFailedTips)))
            .finally(() => dispatch({
                loading: false
            }))
    }

    useEffect(() => {
        loadImages()
    }, [])

    return (
        <DemoWrapper
            loading={loading}
            className="demo2"
        >
            <StartCom
                isRealoadVisible={isRealoadVisible}
                imgList={imgList}
            />
            <EndCom
                isRealoadVisible={isRealoadVisible}
                setIsRealoadVisible={setIsRealoadVisible}
                imgList={imgList}
            />
        </DemoWrapper>
    )
};

export default Test;
