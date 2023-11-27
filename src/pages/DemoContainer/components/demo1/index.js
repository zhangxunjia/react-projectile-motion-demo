import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EndCom from './components/EndCom';
import StartCom from './components/StartCom';
import { getImage } from 'src/tools/axios'
import DemoWrapper from 'src/components/DemoWrapper'
import './index.scss'
import { FloatButton, message } from 'antd';
import { SettingOutlined, PlusOutlined, AimOutlined, CheckOutlined, ShoppingCartOutlined  } from '@ant-design/icons';
import { uuid } from 'src/tools/utils'
import Draggable from 'react-draggable';
import EditModal from './components/EditModal'
import 'animate.css';
import { loadImageFailedTips } from 'src/data/constant';

const initialState = {
    startComList: [
        {
            id: uuid(),
            style: { top: '25%', left: '25%', width: '50px', height: '50px'},
            projectileMotionPorps:{
                subscription: 'subscriptionName'
            }
        }
    ],
    endComList: [
        {
            id: uuid(),
            style: { top: '60%', left: '60%', width: '50px', height: '50px'},
            projectileMotionPorps:{
                subscription: 'subscriptionName',
                endingDomAnimationName:'swing',
                additionalTransformValueInAnimate: 'scale(1.5)'
            }
        }
    ],
    // 是否进入移动状态
    movingStatus: false,
    // 是否进入编辑状态
    settingStatus: false,
    // 是否打开编辑详情
    editDetailOpen: false,
    // 编辑框是否可见
    editOpen: false,
    // 编辑框的数据
    editData: {},
    // 图片映射
    imgMap: {
        start: {
            url:require('src/assets/images/start.png'),
            src:''
        },
        end: {
            url: require('src/assets/images/end.png'),
            src:''
        }
    },
    // 加载状态
    loading: false
}

// 新增的 startDom 的默认设置
const defaultStartCom = {
    style: {top: '0', left: '0', width: '50px', height: '50px'},
    projectileMotionPorps:{
        subscription:'subscriptionName'
    }
}
// 新增的 endDom 的默认设置
const defaultEndCom = {
    style:{top: '50%', left: '50%', width: '50px', height: '50px'},
    projectileMotionPorps:{
        subscription: 'subscriptionName',
        endingDomAnimationName:'swing',
        additionalTransformValueInAnimate: 'scale(1.5)'
    }
}


const Demo = () => {
    const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), initialState);

    const {
        startComList,
        endComList,
        movingStatus,
        editDetailOpen,
        settingStatus,
        editOpen,
        editData,
        editType,
        imgMap,
        loading
    } = state;

    const { t } = useTranslation();

    const demoRef = useRef();
    // 记录开始拖动 / 点击 时的FloatButton的临时位置存储信息
    const draggableDomPositionRef = useRef();
    // 获取 FloatButton 的位置信息
    const getFloatButtonBoundingClientRect = () => demoRef.current.querySelector('.float-button').getBoundingClientRect()

    // 是否为编辑状态(移动中 或 编辑中)
    const isEditing = useMemo(() => movingStatus || settingStatus, [movingStatus, settingStatus])

    // 是否为进入编辑状态的事件（编辑框里按钮的原始功能）
    const disabledDraggableStopFun = useRef(false);

    // 是否为移动端
    const isMobile = /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);

    // 加载本demo所需图片
    const loadImages = () => {
        dispatch({
            loading: true
        })
        Promise.all(Object.entries(imgMap).map(([key, value]) => getImage(value.url)))
            .then((resList) => {
                dispatch({
                    imgMap: {
                        start: {
                            url:require('src/assets/images/start.png'),
                            src: resList[0]
                        },
                        end: {
                            url: require('src/assets/images/end.png'),
                            src: resList[1]
                        }
                    }
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

    useEffect(() => {
        if(isEditing) {
            onFloatButtonClick()
        }
    }, [isEditing])

    // 打开编辑Modal
    const openEditModal = (editData, editType) => {
        dispatch({
            editOpen:true,
            editData,
            editType
        })
    }

    // 设置编辑模式
    const changeSettingStatus = (settingStatus) => {
        dispatch({
            settingStatus
        })
    }

    // 新增startCom
    const addStartCom = () => {
        message.success(t('startingDom has been added'))
        dispatch({
            startComList: [
                ...startComList,
                {
                    id: uuid(),
                    ...defaultStartCom
                }
            ]
        });
    }

    // 新增endCom
    const addEndCom = () => {
        message.success(t('endingDom has been added'))
        dispatch({
            endComList: [
                ...endComList,
                {
                    id: uuid(),
                    ...defaultEndCom
                }
            ]
        });
    }

    // 设置移动状态
    const setMoveStatus = (movingStatus) => {
        dispatch({
            movingStatus
        });
    }

    // 打开/ 关闭 编辑详情
    const onFloatButtonClick = () => {
        dispatch({
            editDetailOpen:!editDetailOpen
        })
    }


    // 记录开始拖动 / 点击 时的位置
    const onFloatButtonDraggableStart = () => {
        draggableDomPositionRef.current = JSON.stringify(getFloatButtonBoundingClientRect());
    }

    // onFloatButtonDraggableStop判断为点击时的具体操作
    const floatButtonDraggableStopAction = () => {
        if(!disabledDraggableStopFun.current) {
            // 编辑状态 绿色的勾
            if(isEditing) {
                confirmChange()
            // 蓝色的设置按钮
            } else {
                onFloatButtonClick()
            }
        }
        disabledDraggableStopFun.current = false
    }

    // FloatButton 对应的 Draggable 拖动停止
    // 注意: react-draggable子元素的点击事件和Draggable的onStart,onStop等事件会同时触发
    // 判断 onStart 和 onStop 事件前后 Draggable 发生变化，无变化则为点击事件，变化了就是拖动事件
    const onFloatButtonDraggableStop = () => {
        if(JSON.stringify(getFloatButtonBoundingClientRect()) === draggableDomPositionRef.current) {
            // 因移动端的事件是由onTouchStart触发的，触发onTouchStart的同时又会触发onFloatButtonDraggableStop，但onClick不会
            if(isMobile){
                setTimeout(() => {
                    floatButtonDraggableStopAction()
                }, 0);
            } else {
                floatButtonDraggableStopAction()
            }
        }
    }

    // FloatButton确认更改
    const confirmChange = () => {
        setMoveStatus(false)
        changeSettingStatus(false)
    }

    // 编辑Modal确认 修改参数
    const onEditModalConfirm = (data, editType) => {
        const comListName = editType === 'start' ? 'startComList' : 'endComList'
        const list = state[comListName].slice()
        const obj = list.find((i) => i.id === data.id)
        obj.projectileMotionPorps = data.projectileMotionPorps
        dispatch({
            [comListName]: list
        })
        onEditModalCancel()
    }

    // 编辑Modal取消
    const onEditModalCancel = () => {
        const {
            editOpen,
            editData,
            editType
        } = initialState
        dispatch({
            editOpen,
            editData,
            editType
        })
    }

    // 更改配置
    const handleChangeSetting = () => {
        disabledDraggableStopFun.current = !!isMobile
        changeSettingStatus(true)
    }

    // 增加startDom
    const handleAddStartCom = () => {
        disabledDraggableStopFun.current = !!isMobile
        addStartCom()
    }

    // 增加endingDom
    const handleAddEndCom = () => {
        disabledDraggableStopFun.current = !!isMobile
        addEndCom()
    }

    // 移动
    const handleSetMoveStatus = () => {
        disabledDraggableStopFun.current = !!isMobile
        setMoveStatus(true)
    }

    return (
        <DemoWrapper
            loading={loading}
            ref={demoRef}
            className="demo1"
        >
            {
                imgMap && imgMap.start && startComList.map((item) => (
                    <StartCom
                        key={item.id}
                        item={item}
                        movingStatus={movingStatus}
                        settingStatus={settingStatus}
                        openEditModal={openEditModal}
                        imgMap={imgMap}
                    />
                ))
            }
            {
                imgMap && imgMap.end && endComList.map((item) => (
                    <EndCom
                        key={item.id}
                        item={item}
                        movingStatus={movingStatus}
                        settingStatus={settingStatus}
                        openEditModal={openEditModal}
                        imgMap={imgMap}
                    />
                ))
            }

            <Draggable
                onStart={onFloatButtonDraggableStart}
                onStop={onFloatButtonDraggableStop}
            >
                <FloatButton.Group
                    open={editDetailOpen}
                    className={`float-button ${!isEditing ? '' : 'success-button'}`}
                    trigger="click"
                    type={!isEditing ? "primary" : "default"}
                    icon={!isEditing ? <SettingOutlined /> : <CheckOutlined />}
                >
                    <FloatButton
                        tooltip={t('Settings')}
                        icon={<SettingOutlined />}
                        onClick={handleChangeSetting}
                        onTouchStart={handleChangeSetting}
                    />
                    <FloatButton
                        tooltip={t('Add a new startingDom')}
                        icon={<PlusOutlined />}
                        onClick={handleAddStartCom}
                        onTouchStart={handleAddStartCom}
                    />
                    <FloatButton
                        tooltip={t('Add a new endingDom')}
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddEndCom}
                        onTouchStart={handleAddEndCom}
                    />
                    <FloatButton
                        tooltip={t('Move')}
                        icon={<AimOutlined />}
                        onClick={handleSetMoveStatus}
                        onTouchStart={handleSetMoveStatus}
                    />
                </FloatButton.Group>
            </Draggable>
            <EditModal
                open={editOpen}
                editData={editData}
                editType={editType}
                onEditModalCancel={onEditModalCancel}
                onEditModalConfirm={onEditModalConfirm}
            />
        </DemoWrapper>
    )
};

export default Demo;
