package client;

import client.model.ClientConfig;
import client.util.MetricsUtility;

/**
 * Skier Client.
 */
public class StressClient {

  private final ClientConfig config;

  public StressClient(ClientConfig config) {
    this.config = config;
  }

  /**
   * Driver Program.
   */
  public static void main(String[] argv) throws Exception {
    if (argv.length != 5) {
      System.err.println("Invalid Param : Thread Skier# Ski# MeanSkiLift URL");
      System.exit(-1);
    }

    int threadNum = Integer.parseInt(argv[0]);
    int skierNum = Integer.parseInt(argv[1]);
    int skierLifts = Integer.parseInt(argv[2]);
    int numRun = Integer.parseInt(argv[3]);
    String url = argv[4];
    ClientConfig config = new ClientConfig(threadNum, skierNum, skierLifts, numRun, url);

    System.out.printf("Parameter : [Thread %d][SkierNum %d][SkierLifts %d][NumRun %d]\n", threadNum, skierNum, skierLifts, numRun);
    StressClient client = new StressClient(config);
    client.execute();
  }

  /**
   * Main Execution logic.
   * Create 3 Phase request runner, then execute 1 by 1,
   * In the client.RequestRunner, there is 2 CountDownLatch, for Entire / Partial Thread.
   */
  private void execute() throws Exception {
    RequestRunner phase1 = getPhaseRunner(1);
    // RequestRunner phase2 = getPhaseRunner(2);
    // RequestRunner phase3 = getPhaseRunner(3);

    long totalBefore = MetricsUtility.getTime();
    phase1.execute();
    // phase2.execute();
    // phase3.execute();
    System.out.println("Main thread finish");

    phase1.await();
    // phase2.await();
    // phase3.await();

    System.out.println("All threads finish");
    long totalAfter = MetricsUtility.getTime();

    int executionCount = phase1.getExecutionCount();// + phase2.getExecutionCount() + phase3.getExecutionCount();
    double tps = executionCount * Math.pow(10, 3) / (totalAfter - totalBefore);
//        System.out.printf("Entire %d / %d (ms) = %f tps\n", executionCount, totalAfter - totalBefore, tps);

    System.out.println("Statistic");
    System.out.printf("Entire wall\t%d\n", totalAfter - totalBefore);
    System.out.printf("Entire tps \t%f\n", tps);

    System.out.println("Executing completed");
  }

  /**
   * Factory method to create client.RequestRunner.
   */
  private RequestRunner getPhaseRunner(int phase) {
    int numThreads, numRun, startTime, endTime;
    // switch (phase) {
      // case 1:
        // numThreads = (int) Math.ceil(config.getNumThreads() / 4.0);
        // numRun = (int) ((int) Math.ceil(config.getNumRun() * 0.2) * (config.getNumSkiers() / (config.getNumThreads() / 4)));
        // startTime = 1;
        // endTime = 90;
      //   break;
      // case 2:
      //   numThreads = (int) Math.ceil(config.getNumThreads());
      //   numRun = (int) ((int) Math.ceil(config.getNumRun() * 0.6) * (config.getNumSkiers() / (config.getNumThreads())));
      //   startTime = 91;
      //   endTime = 360;
      //   break;
      // case 3:
      //   numThreads = (int) Math.ceil(config.getNumThreads() / 10.0);
      //   numRun = (int) Math.ceil(config.getNumRun() * 0.1);
      //   startTime = 361;
      //   endTime = 420;
      //   break;
      // default:
      //   throw new IllegalArgumentException("Unsupported Phase");
    // }

    numThreads = (int) config.getNumThreads();
    numRun = (int) ((int) config.getNumRun() * config.getNumSkiers() / config.getNumThreads());
    startTime = 1;
    endTime = 90;

    int numSkiers = (int) config.getNumSkiers();
    int numLifts = (int) config.getNumLifts();
    String url = config.getUrl();

    return new RequestRunner("Phase" + phase, numThreads, numSkiers, numRun, numLifts, startTime, endTime, url);
  }

}
