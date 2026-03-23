import React from "react";
import { Page, Header, Box, Grid, Icon, Text, List, Avatar } from "zmp-ui";
import { openWebview } from "zmp-sdk/apis";

const HomePage = () => {
  const handleOpenUrl = (url: string) => {
    openWebview({ url: url, config: { style: "bottomSheet" } });
  };

  return (
    <Page>
      <Header title="Tự Lạn Smart" showBackIcon={false} />
      
      <Box mt={2} px={4}>
        <img style={{ width: "100%", borderRadius: 12, height: 160, objectFit: "cover" }} 
             src="images/banner.png" alt="Banner Tự Lạn Smart" />
      </Box>

      <Box mt={6} px={4}>
        <Text weight="bold" size="large">Tiện ích trực tuyến</Text>
        <Grid columnCount={3} gutter={15} mt={4}>
          <Box flex flexDirection="column" alignItems="center" onClick={() => alert("Đang phát triển")}>
            <Icon icon="zi-calendar" color="#0068ff" />
            <Text size="xxSmall" mt={1}>Đặt lịch</Text>
          </Box>
          <Box flex flexDirection="column" alignItems="center" onClick={() => alert("Đang phát triển")}>
            <Icon icon="zi-Atm-2" color="#ff9800" />
            <Text size="xxSmall" mt={1}>Phản ánh</Text>
          </Box>
          <Box flex flexDirection="column" alignItems="center" onClick={() => handleOpenUrl("https://dichvucong.gov.vn")}>
            <Icon icon="zi-shield-check" color="#4caf50" />
            <Text size="xxSmall" mt={1}>DVC</Text>
          </Box>
          <Box flex flexDirection="column" alignItems="center" onClick={() => handleOpenUrl("https://tu-lan-dvc-ai-v3.vercel.app/?token=tu-lan-2025")}>
            <Icon icon="zi-chat" color="#e91e63" />
            <Text size="xxSmall" mt={1}>Chatbot AI</Text>
          </Box>
          <Box flex flexDirection="column" alignItems="center" onClick={() => handleOpenUrl("https://zalo.me/155482019626526050")}>
            <Icon icon="zi-info-circle" color="#9c27b0" />
            <Text size="xxSmall" mt={1}>Tin tức</Text>
          </Box>
        </Grid>
      </Box>

      <Box mt={6} px={4} pb={10}>
        <Text weight="bold" size="large">Tin tức & Thông báo</Text>
        <List mt={2}>
          <List.Item 
            title="Cổng thông tin điện tử Phường" 
            onClick={() => handleOpenUrl("https://tulan.bacninh.gov.vn/trang-chu?p_p_id=mainnews_WAR_bacninhportlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view")}
            prefix={<Avatar src="images/logo.png" />}
          />
          <List.Item 
            title="Zalo Official Account" 
            onClick={() => handleOpenUrl("https://zalo.me/155482019626526050")}
            prefix={<Icon icon="zi-zalo" color="#0068ff" />}
          />
        </List>
      </Box>
    </Page>
  );
};
export default HomePage;