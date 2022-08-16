package client;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.Vector;
import java.util.concurrent.CountDownLatch;
import client.util.MetricsUtility;

public class RequestRunner {

  private static final String URL_PARAM = "/";

  private final int numSkiers;
  private final int numThread;
  private final int numRun;
  private final int numLifts;
  private final int startTime;
  private final int endTime;
  private final String url;
  private final String desc;
  private final CountDownLatch totalCountDownLatch;

  public RequestRunner(String desc, int numThreads, int numSkiers, int numRun, int numLifts, int startTime, int endTime, String url) {
    this.desc = desc;
    this.numSkiers = numSkiers;
    this.numThread = numThreads;
    this.numRun = numRun;
    this.numLifts = numLifts;
    this.startTime = startTime;
    this.endTime = endTime;
    this.url = url;
    this.totalCountDownLatch = new CountDownLatch(this.numThread);

    System.out.printf("Creating %s with thread# %d, numRun %d\n", desc, numThreads, numRun);
  }

  /**
   * Return the total number of execution for this phase.
   */
  public int getExecutionCount() {
    return numThread * numRun;
  }

  /**
   * Main Execution Loop.
   */
  public void execute() throws InterruptedException {

    int partialCount = (int) Math.ceil(this.numThread * 0.2);
    CountDownLatch partialCountDownLatch = new CountDownLatch(partialCount);
    System.out.printf("%s is executing with %d/%d\n", desc, partialCount, numThread);

    List<ThreadRunner> list = new Vector<>();
    for (int i = 0; i < numThread; i++) {
      int startSkierId = 1 + (i * (numSkiers / (numThread)));
      int endSkierId = (i + 1) * (numSkiers / (numThread));
      int skierId = MetricsUtility.getRandomInt(startSkierId, endSkierId);
      int time = MetricsUtility.getRandomInt(startTime, endTime);
      list.add(new ThreadRunner(desc, skierId, time, numRun, numLifts, url, partialCountDownLatch, totalCountDownLatch));
    }

    long totalBefore = MetricsUtility.getTime();
    list.parallelStream().forEach(Thread::start);
    partialCountDownLatch.await();

    System.out.printf("%s have executed %d/%d\n", desc, partialCount, numThread);

    // Start a local thread to process remaining data
    Runnable runnable = () -> {
      try {
        System.out.printf("%s will monitor the remaining threads (%d-%d)\n", desc, partialCount + 1, numThread);

        // Wait for the total Count Down
        totalCountDownLatch.await();

        long totalAfter = MetricsUtility.getTime();
        double tps = numThread * numRun * Math.pow(10, 3) / (totalAfter - totalBefore);
//        System.out.printf("%s : %d / %d (ms) = %f tps\n", desc, numThread * numRun, totalAfter - totalBefore, tps);

        System.out.println(String.format("%s wall\t%d", desc, totalAfter - totalBefore));
        System.out.println(String.format("%s tps \t%f", desc, tps));

        MetricsUtility.flush(desc, desc + ".csv");
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    };

    new Thread(runnable).start();
  }

  /**
   * Handler to wait for the entire thread completion.
   */
  public void await() throws InterruptedException {
    totalCountDownLatch.await();
  }

  /**
   * Thread Runner to execute the actual work.
   */
  private static class ThreadRunner extends Thread {

    private final String desc;
    private final int skierId;
    private final int time;
    private final int numRun;
    private final int numLifts;
    private final String url;
    private final CountDownLatch partialCountDownLatch;
    private final CountDownLatch totalCountDownLatch;
    private final HttpClient httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_2)
        .connectTimeout(Duration.ofSeconds(10000))
        .build();

    private ThreadRunner(String desc, int skierId, int time, int numRun, int numLifts, String url, CountDownLatch partialCountDownLatch, CountDownLatch totalCountDownLatch) {
      this.desc = desc;
      this.skierId = skierId;
      this.time = time;
      this.numRun = numRun;
      this.numLifts = numLifts;
      this.url = url;
      this.partialCountDownLatch = partialCountDownLatch;
      this.totalCountDownLatch = totalCountDownLatch;
    }

    @Override
    public void run() {
      String finalURL = this.url;

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(finalURL))
          .setHeader("User-Agent", "Java 11 HttpClient Bot")
          .header("Content-Type", "application/json")
          .timeout(Duration.ofSeconds(10000))
          .build();

      for (int i = 0; i < numRun; i++) {
        long before = MetricsUtility.getTime();
        String beforeHHMM = MetricsUtility.convertTimeHHMMSS(before);
//        HttpResponse<String> response = getStringHttpResponse(request);
        int response = getStringHttpResponse(request);
        long after = MetricsUtility.getTime();
        String afterHHMM = MetricsUtility.convertTimeHHMMSS(after);
//        if (response != null) {
//          MetricsUtility.append(desc, String.format("%s,%s,%d,%d,%d,%d,%s,%s,%s", new Date(), "GET", (after - before), response.statusCode(), before, after, beforeHHMM, afterHHMM, skierId));
//        } else {
        if (response != -1) {
            MetricsUtility.append(desc, String.format("%s,%d,%s,%d,%d,%d,%d,%s,%s,%s", new Date(), System.nanoTime(), "GET", (after - before), response, before, after, beforeHHMM, afterHHMM, skierId));
          } else {
          System.err.printf("%s %d is failed with null response\n", desc, skierId);
        }
      }

      partialCountDownLatch.countDown();
      totalCountDownLatch.countDown();

//      System.out.printf("%s Count %d\n", desc, this.totalCountDownLatch.getCount());
    }

    //private HttpResponse<String> getStringHttpResponse(HttpRequest request) {
    private int getStringHttpResponse(HttpRequest request) {
      for (int i = 0; i < 5; i++) {
        try {


          URL url = new URL(this.url);
          HttpURLConnection con = (HttpURLConnection) url.openConnection();
          con.setRequestMethod("GET");
          int status = con.getResponseCode();

          if (status != 200) {
            System.err.printf("%s %d failed with response code : %s %s\n", desc, skierId, status, con.getResponseMessage());
          }

//          HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
//          if (response.statusCode() != 200) {
//            System.err.printf("%s %d failed with response code : %s %s\n", desc, skierId, response.statusCode(), response.body());
//          }

          return status;
        } catch (Exception e) {
          System.err.printf("%s %d failed with %s\n", desc, skierId, e.getMessage());
        }
      }
      return -1;
    }
  }
}