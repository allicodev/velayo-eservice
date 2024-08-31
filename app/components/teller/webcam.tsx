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
import {
  ReloadOutlined,
  LeftOutlined,
  CameraOutlined,
} from "@ant-design/icons";

import UserService from "@/provider/user.service";
import { ProtectedUser } from "@/types";
import LogService from "@/provider/log.service";
import { useUserStore } from "@/provider/context";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
    lastTimeIn?: Date | null;
    lastTimeOut?: Date | null;
    logId?: string;
  }>({
    disableTimeIn: false,
    disableTimeOut: false,
    lastTimeIn: null,
    lastTimeOut: null,
    logId: "",
  });
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [currentOpenedUser, setCurrentOpenedUser] =
    useState<ProtectedUser | null>(null);
  const [step, setStep] = useState(0);
  const [loader, setLoader] = useState("");

  // important details
  const [employeeId, setEmployeeId] = useState("");

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
              autoFocus
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
        <Button
          type="primary"
          onClick={() => handleTimeUpdate("in")}
          disabled={disableTime.disableTimeIn || loader == "out"}
          // loading={loader == "in"}
          style={{
            height: 70,
            fontSize: "2.5em",
            flex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {disableTime.disableTimeIn
            ? "Last Timed in: " + dayjs(disableTime.lastTimeIn).format("hh:mma")
            : "Time-In"}
        </Button>
        <Button
          type="primary"
          disabled={disableTime.disableTimeOut || loader == "in"}
          onClick={() => handleTimeUpdate("out")}
          // loading={loader == "out"}
          style={{
            height: 70,
            fontSize: "2.5em",
            flex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {disableTime.disableTimeOut && disableTime.lastTimeOut != null
            ? "Last Timed out: " +
              dayjs(disableTime.lastTimeOut).format("hh:mma")
            : "Time-Out"}
        </Button>
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
    })(UserService);
  };

  const handleTimeUpdate = (type: "in" | "out") => {
    // if (type == "in") {
    setLoader(type);
    let timeIn = new Date();

    (async (_) => {
      let { success, data } = await _.getLog({
        userId: currentOpenedUser?._id ?? "",
        fromDate: dayjs(),
        toDate: dayjs(),
        page: 1,
        pageSize: 99999,
        type: "attendance",
      });

      if (success) {
        if ((data?.length ?? 0) > 0) {
          let res2 = await _.updateLog({
            _id: data![0]._id,
            $push: {
              flexiTime: {
                type: type == "in" ? "time-in" : "time-out",
                time: dayjs(),
                photo: imgSrc,
              },
            },
          });

          if (res2?.success ?? false) {
            message.success(
              `Successfully ${type == "in" ? "Timed-In" : "Timed-out"}`
            );
            setCameraOpen(false);
            setImgSrc(null);
            setTimeout(close, 1);
            setStep(0);
            setLoader("");
          } else setLoader("");
        } else {
          let res = await _.newLog({
            userId: currentOpenedUser?._id ?? "",
            type: "attendance",
            flexiTime: [{ type: "time-in", time: timeIn, photo: imgSrc }],
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
        }
      }
    })(LogService);
    // } else {
    //   setLoader("out");
    //   let timeOut = new Date();
    //   if (
    //     timeOut.getHours() > 20 ||
    //     (timeOut.getHours() === 20 && timeOut.getMinutes() >= 30)
    //   ) {
    //     timeOut.setHours(20, 30, 0);
    //   }
    //   (async (_) => {
    //     let res = await _.updateLog({
    //       _id: disableTime.logId,
    //       timeOut,
    //       timeOutPhoto: imgSrc,
    //     });

    //     if (res?.success ?? false) {
    //       message.success("Successfully Timed-Out");
    //       setCameraOpen(false);
    //       setImgSrc(null);
    //       setTimeout(close, 1);
    //       setStep(0);
    //       setLoader("");
    //     } else setLoader("");
    //   })(LogService);
    // }
  };

  const checkIfTimeIsDone = () => {
    (async (_) => {
      let res = await _.getLog({
        page: 1,
        pageSize: 99999,
        fromDate: dayjs(),
        toDate: dayjs(),
        userId: currentOpenedUser?._id ?? "",
        type: "attendance",
      });

      if ((res?.data && res?.data.length > 0) ?? false) {
        if (res?.data![0].flexiTime.at(-1)?.type == "time-in")
          setDisabledTime({
            ...disableTime,
            lastTimeIn: res?.data![0].flexiTime.at(-1)?.time,
            disableTimeIn: true,
            disableTimeOut: false,
          });
        else
          setDisabledTime({
            ...disableTime,
            lastTimeOut: res?.data![0].flexiTime.at(-1)?.time,
            disableTimeOut: true,
            disableTimeIn: false,
          });
      } else {
        setDisabledTime({
          disableTimeOut: true,
        });
      }
    })(LogService);
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
