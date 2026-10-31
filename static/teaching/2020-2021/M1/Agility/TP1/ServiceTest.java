package services;

import org.junit.*;

import static org.junit.Assert.assertEquals;
import static spark.Spark.awaitInitialization;
import static spark.Spark.stop;

public class ServiceTestExample {
    @BeforeClass
    public static void setUp() throws Exception {
        Service service = new Service();
        service.main(null);
        awaitInitialization();
    }

    @AfterClass
    public static void tearDown() throws Exception {
        stop();
    }

    @Test
    public void articleRouteTest() {

        String testUrl = "/article/2020-06-30";

        ApiCall.TestResponse res = ApiCall.request("GET", testUrl, null);
        System.out.println(res.body);
        assertEquals(200, res.status);
    }
}
