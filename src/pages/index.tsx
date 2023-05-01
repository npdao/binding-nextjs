import {
  Button,
  Paper,
  Grid,
  Center,
  Group,
  TextInput,
  Col,
  Container,
  Text,
  Title,
  Modal,
} from "@mantine/core";
import AsyncSelect from 'react-select/async';
import { useDisclosure } from "@mantine/hooks";
import React, { useState, useEffect } from "react";
import { useAccount, useSigner, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { createStyles } from "@mantine/core";
import Link from "next/link";

import { getContractInfo } from "@/utils/contracts";

const useStyles = createStyles((theme) => ({
  post: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.lg,
    fontWeight: 500,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.blue[0],

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },
  error: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.blue[0],

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },
}));

const demoMessages = [
  {
    id: 1,
    message:
      "Discover the power of anonymity with ZkBlind! Our innovative zero-knowledge technology ensures your identity is secure while sharing sensitive information with confidence.",
  },
];

type ZkBlindMessage = {
  id: number;
  message: string;
};

export default function Index() {
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);
  // later improve the code to query the current chain
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [selectedMerchant, setSelectedMerchant] = useState(""); // State for the selected merchant
  // const tempdata = [
  //   {"label":"Siam Commercial Bank","value":1},
  //   {"label":"Seven Eleven","value":2},
  //   {"label":"Global Lotus","value":3},
  // ];
  const [merchants, setMerchants] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");      
  const [showModal, setShowModal] = useState(false);     
  const [bindResText, setBindResText] = useState("");  

  useEffect(() => {
    setIsClient(true);
  }, [signer, address]);

  const loadOptions = async (inputValue) => {
    try {
      const response = await fetch(`http://127.0.0.1:8141/getMerchants?keywords=${inputValue}`); // 请替换为您的后端 URL，并根据需要添加查询参数
      let data = await response.json();
      data = data.data;
      console.log("Data ...", data);
      return data.map((merchant) => ({
        value: merchant.id,
        label: merchant.name,
      }));
    } catch (error) {
      console.error('Error fetching merchants:', error);
      return [];
    }
  };

  async function confirmBind() {
    event.preventDefault();
    try {
      const message = JSON.stringify({
        mobileNumber: mobileNumber,
        selectedMerchant: selectedMerchant,
        walletAddress: address,
      });

      if(!mobileNumber){
        throw("invalid mobileNumber");
      }
      if(!selectedMerchant){
        throw("invalid selectedMerchant");
      }
      if(!walletAddress){
        throw("invalid walletAddress");
      }
  
      // Sign the message using the signer
      const signature = await signer?.signMessage(message);
  
      // Send the signed message to the backend
      const response = await fetch("http://127.0.0.1:8141/bindMerchants", { // Replace with your backend URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          signature: signature,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Successfully bound account:", data);
        const addressStart = address?.slice(0, 6);
        const addressEnd = address?.slice(-4);

        setBindResText(
          `Account[${mobileNumber}] has been bind with wallet[${addressStart}...${addressEnd}].`
        );
        setShowModal(true);
        // Handle success, e.g., show a success message or close the modal
      } else {
        console.error("Failed to bind account:", response);
        setBindResText("Account has already bind...");
        // Handle error, e.g., show an error message
      }
    } catch (error) {
      console.error("Failed to bind account:", error);
      // Handle error, e.g., show an error message
    }
  }

  const closeModal = () => {
    setShowModal(false);
    location.reload();
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "4px",
      minHeight: "38px",
    }),
  };

  return (
    <>
    {isClient && (
      <Container>
        <Paper p="md" shadow="xs">
          <Title order={4} align="center">
            Binding Account
          </Title>
          <form onSubmit={confirmBind}>
            <Grid gutter="md">
              <Col span={12}>
              <Text mb={10}>Mobile Number</Text>
                  <TextInput
                    placeholder="Your Mobile Number"
                    size="md"
                    radius="md"
                    value={mobileNumber}
                    onChange={(event) =>
                      setMobileNumber(event.currentTarget.value)
                    }
                  />
              </Col>
              <Col span={12}>
              <Text mb={10}>Select a merchant</Text>
              <AsyncSelect
                styles={customStyles}
                mb={10}
                placeholder="search..."
                loadOptions={loadOptions}
                onChange={(option) => setSelectedMerchant(option.value)}
              />
              </Col>
            </Grid>
            <Center>
              <Button mt={10} type="submit">
                Submit
              </Button>
            </Center>
          </form>
        </Paper>
      </Container>
    )}

    {showModal && (
        <Modal
          opened={showModal}
          onClose={closeModal}
          title="Binding Successful"
          size="md"
        >
          <div>{bindResText}</div>
          <Button onClick={closeModal} style={{ marginTop: '1rem' }}>
            Close
          </Button>
        </Modal>
      )}
  </>
  );
}
