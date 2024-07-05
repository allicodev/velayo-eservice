import React, { useCallback, useState } from "react";
import {
  Button,
  Image,
  Input,
  Modal,
  Tooltip,
  Typography,
  message,
} from "antd";
import Webcam from "react-webcam";
import { CiLogin, CiLogout } from "react-icons/ci";
import {
  ReloadOutlined,
  LeftOutlined,
  CameraOutlined,
} from "@ant-design/icons";

import UserService from "@/provider/user.service";
import { ProtectedUser } from "@/types";
import LogService from "@/provider/log.service";
import { useUserStore } from "@/provider/context";
import dayjs, { Dayjs } from "dayjs";

const WebCamera = ({
  open,
  close,
  webcamRef,
}: {
  open: boolean;
  close: () => void;
  webcamRef: React.RefObject<Webcam>;
}) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [disableTime, setDisabledTime] = useState<{
    disableTimeIn?: boolean;
    disableTimeOut?: boolean;
    timeInTime?: Date | null;
    timeOutTime?: Date | null;
    logId?: string;
  }>({
    disableTimeIn: false,
    disableTimeOut: false,
    timeInTime: null,
    timeOutTime: null,
    logId: "",
  });
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [currentOpenedUser, setCurrentOpenedUser] =
    useState<ProtectedUser | null>(null);
  const [step, setStep] = useState(0);
  const [loader, setLoader] = useState("");

  // important details
  const [employeeId, setEmployeeId] = useState("");

  // context and services
  const user = new UserService();
  const log = new LogService();
  const { currentUser, currentBranch } = useUserStore();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImgSrc(imageSrc || null);
  }, [webcamRef]);

  const videoConstraints = {
    width: 900,
    height: 600,
    facingMode: "user",
  };

  const renderBody = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Welcome to Attendance
              </Typography.Title>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Please input your User ID first
              </Typography.Title>
            </div>
            <Input
              className="customInput size-70"
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{
                width: "100%",
                height: 70,
                fontSize: "2em",
                textAlign: "center",
                letterSpacing: 3,
              }}
            />
            <Button
              onClick={handleCheckUser}
              type="primary"
              style={{
                height: 70,
                fontSize: "2.5em",
              }}
              block
            >
              NEXT
            </Button>
          </div>
        );
      case 1:
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography.Title level={2}>Identity Confirmation</Typography.Title>

            <Typography.Text
              style={{
                borderBottom: "1px solid #aaa",
                fontSize: "2em",
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              {currentOpenedUser?.name}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: "2em",
                letterSpacing: 2,
              }}
            >
              {currentOpenedUser?.role?.toLocaleUpperCase()}
            </Typography.Text>
            <Button
              onClick={() => {
                if (employeeId == "") {
                  message.warning("Please enter employee ID first");
                  return;
                }
                setCameraOpen(true);
                setStep(2);
              }}
              type="primary"
              style={{
                height: 70,
                fontSize: "2.5em",
                marginTop: 50,
              }}
              block
            >
              Confirmed and Open Camera
            </Button>
          </div>
        );

      case 2:
        return showCamera();
      case 3:
        return showCapturedImage();
      default:
        return <></>;
    }
  };

  const showCamera = () => (
    <>
      <Webcam
        audio={false}
        height={600}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={850}
        videoConstraints={videoConstraints}
        mirrored
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 15,
        }}
      >
        <Button
          icon={
            <LeftOutlined
              style={{
                fontSize: "2em",
              }}
            />
          }
          style={{
            height: 70,
            flex: 1,
          }}
          onClick={() => {
            setCameraOpen(false);
            setStep(1);
          }}
        />
        <Button
          type="primary"
          icon={<CameraOutlined />}
          onClick={() => {
            capture();
            setStep(3);

            checkIfTimeIsDone();
          }}
          style={{
            height: 70,
            width: 300,
            fontSize: "2.5em",
            flex: 6,
          }}
        >
          Capture
        </Button>
      </div>
    </>
  );

  const showCapturedImage = () => (
    <div>
      <Image
        src={imgSrc!}
        preview={false}
        alt="screenshot"
        style={{
          borderRadius: 10,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 10,
        }}
      >
        <Tooltip title="Re-capture">
          <Button
            icon={
              <ReloadOutlined
                style={{
                  fontSize: "2em",
                }}
              />
            }
            style={{
              height: 70,
              flex: 1,
            }}
            onClick={() => setStep(2)}
          />
        </Tooltip>
        <Tooltip
          title={
            disableTime.disableTimeIn ? "Already Timed-In for the day" : ""
          }
        >
          <Button
            type="primary"
            onClick={() => handleTimeUpdate("in")}
            disabled={disableTime.disableTimeIn || loader == "out"}
            loading={loader == "in"}
            style={{
              height: 70,
              fontSize: "2.5em",
              flex: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* <CiLogin style={{ marginRight: 15 }} />*/} Time-In{" "}
            {disableTime.disableTimeIn
              ? `(${dayjs(disableTime.timeInTime).format("hh:mm a")})`
              : ""}
          </Button>
        </Tooltip>
        <Tooltip
          title={
            disableTime.disableTimeOut
              ? disableTime.timeOutTime
                ? "Already Timed-Out for the day"
                : "Time-In is needed to Time-Out"
              : ""
          }
        >
          <Button
            type="primary"
            disabled={disableTime.disableTimeOut || loader == "in"}
            onClick={() => handleTimeUpdate("out")}
            loading={loader == "out"}
            style={{
              height: 70,
              fontSize: "2.5em",
              flex: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* <CiLogout style={{ marginRight: 15 }} /> */} Time-Out{" "}
            {disableTime.disableTimeOut
              ? disableTime.timeOutTime != null
                ? `(${dayjs(disableTime.timeOutTime).format("hh:mm a")})`
                : ""
              : ""}
          </Button>
        </Tooltip>
      </div>
    </div>
  );

  const handleCheckUser = () => {
    if (employeeId == "") {
      message.warning("User ID doesn't exist in the system.");
      return;
    }

    (async (_) => {
      let res = await _.getUsers({
        employeeId,
      });

      if (res?.data ?? false) {
        setCurrentOpenedUser((res?.data as any) ?? null);
        setStep(1);
      } else {
        message.error("There are no employee registered with this User ID");
        return;
      }
    })(user);
  };

  const handleTimeUpdate = (type: "in" | "out") => {
    if (type == "in") {
      setLoader("in");
      let timeIn = new Date();

      if (timeIn.getHours() < 7) timeIn.setHours(7, 0);

      (async (_) => {
        let res = await _.newLog({
          userId: currentOpenedUser?._id ?? "",
          type: "attendance",
          timeInPhoto: imgSrc,
          timeIn,
          postType: "new",
          ...(["admin", "encoder"].includes(currentUser?.role!)
            ? {}
            : {
                branchId: currentBranch,
              }),
        });

        if (res?.success ?? false) {
          message.success("Successfully Timed-In");
          setCameraOpen(false);
          setImgSrc(null);
          setTimeout(close, 1);
          setStep(0);
          setLoader("");
        } else setLoader("");
      })(log);
    } else {
      setLoader("out");
      let timeOut = new Date();
      if (
        timeOut.getHours() > 20 ||
        (timeOut.getHours() === 20 && timeOut.getMinutes() >= 30)
      ) {
        timeOut.setHours(20, 30, 0);
      }
      (async (_) => {
        let res = await _.updateLog({
          _id: disableTime.logId,
          timeOut,
          timeOutPhoto: imgSrc,
        });

        if (res?.success ?? false) {
          message.success("Successfully Timed-Out");
          setCameraOpen(false);
          setImgSrc(null);
          setTimeout(close, 1);
          setStep(0);
          setLoader("");
        } else setLoader("");
      })(log);
    }
  };

  const checkIfTimeIsDone = () => {
    (async (_) => {
      let res = await _.getLog({
        page: 1,
        pageSize: 99999,
        fromDate: dayjs(),
        toDate: dayjs(),
        userId: currentOpenedUser?._id ?? "",
      });

      if ((res?.data && res?.data.length > 0) ?? false) {
        if (res?.data![0]?.timeOut != null ?? false) {
          setDisabledTime({
            ...disableTime,
            disableTimeOut: true,
            timeOutTime: res?.data![0]?.timeOut ?? null,
            ...(res?.data![0]?.timeIn != null ?? false
              ? {
                  disableTimeIn: true,
                  timeInTime: res?.data![0]?.timeIn ?? null,
                }
              : {}),
          });
        } else
          setDisabledTime({
            ...disableTime,
            disableTimeOut: false,
            logId: res?.data![0]?._id ?? "",
            ...(res?.data![0]?.timeIn != null ?? false
              ? {
                  disableTimeIn: true,
                  timeInTime: res?.data![0]?.timeIn ?? null,
                }
              : {}),
          });
      } else {
        setDisabledTime({
          disableTimeOut: true,
        });
      }
    })(log);
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setCameraOpen(false);
        setImgSrc(null);
        setStep(0);

        setTimeout(close, 1);
      }}
      width={cameraOpen ? 900 : undefined}
      closable={false}
      footer={null}
    >
      {renderBody(step)}
    </Modal>
  );
};

export default WebCamera;
