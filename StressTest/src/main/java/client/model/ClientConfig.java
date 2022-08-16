package client.model;

/**
 * Class for the Client Configuration.
 */
public class ClientConfig {

  private double numThreads;
  private double numSkiers;
  private double numLifts;
  private double numRun;
  private String url;

  public ClientConfig(int numThreads, int numSkiers, int numLifts, int numRun, String url) {
    this.numThreads = numThreads;
    this.numSkiers = numSkiers;
    this.numLifts = numLifts;
    this.numRun = numRun;
    this.url = url;
  }

  public double getNumThreads() {
    return numThreads;
  }

  public double getNumSkiers() {
    return numSkiers;
  }

  public double getNumLifts() {
    return numLifts;
  }

  public double getNumRun() {
    return numRun;
  }

  public String getUrl() {
    return url;
  }
}