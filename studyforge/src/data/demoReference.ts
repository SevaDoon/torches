/*
 * The sample course's reference.
 *
 * It is a document, not a question bank. The demo course is built by running
 * this text through exactly the same pipeline an uploaded PDF goes through —
 * so what a visitor plays is the real extractor, the real generator and the
 * real validation gate, and every citation in it points at a real span of a
 * real file. A hand-written demo would have proved nothing about the product.
 *
 * It is clearly marked as a sample everywhere it appears (Course.isDemo).
 */

export const DEMO_NAME = 'Applied Statistics';

export const DEMO_REFERENCE = `Applied Statistics — Course Reference

Chapter 1 Introduction to Statistics

1.1 What Statistics Studies

Statistics is the science of collecting, organising, summarising and drawing conclusions from data. Descriptive statistics is the branch that summarises the data actually collected, without claiming anything beyond it. Inferential statistics is the branch that uses a sample to make statements about the larger group the sample came from.

A population is the entire collection of individuals or measurements that a study is about. A sample is the subset of the population that is actually observed and measured. A census is a study in which every member of the population is measured, which is rare because it is usually too expensive or too slow.

A parameter is a numerical summary of a population, such as the average height of all adults in a country. A statistic is a numerical summary of a sample, such as the average height of the two hundred adults who were actually measured. The distinction matters because a parameter is fixed and usually unknown, while a statistic changes from one sample to the next.

1.2 Variables and Data

A variable is any characteristic that can differ from one individual to another. A qualitative variable is one whose values are categories rather than numbers, such as blood type or field of study. A quantitative variable is one whose values are numerical measurements that can be ordered and compared.

A discrete variable is a quantitative variable that can take only separated values, usually counts. A continuous variable is a quantitative variable that can take any value in an interval, such as time or mass. Measurement precision limits what we record, so a continuous quantity is always written down as a rounded number.

Sampling error is the difference between a sample statistic and the population parameter it estimates, caused only by the fact that a sample is not the whole population. Bias is a systematic tendency for a sampling method to favour some members of the population over others. Bias does not shrink when the sample grows, because a larger sample repeats the same systematic mistake more times.

Chapter 2 Describing Data

2.1 Measures of Centre

The mean is the sum of all observations divided by the number of observations. The median is the middle value of the observations once they have been arranged in order. The mode is the value that occurs most often in a set of observations.

The mean uses every observation, so a single extreme value can pull it a long way. The median depends only on the position of the middle observation, so it is described as resistant. An outlier is an observation that lies far away from the bulk of the data.

For example, in the salaries 30, 32, 33, 35 and 400 thousand, the mean is 106 while the median is 33. Analysts report the median for income because income distributions usually contain a small number of very large values.

2.2 Measures of Spread

The range is the difference between the largest and the smallest observation. The variance is the average of the squared distances between each observation and the mean. The standard deviation is the square root of the variance, expressed in the original units of measurement.

Deviations are squared before they are averaged because the plain deviations from the mean always sum to zero. The interquartile range is the distance between the first quartile and the third quartile, and it covers the middle half of the data. A quartile is a value that divides the ordered data into four parts of equal size.

The coefficient of variation is the standard deviation divided by the mean, and it allows spread to be compared between quantities measured in different units.

2.3 Shape

A distribution is the pattern showing which values occur and how often each one occurs. Skewness is a lack of symmetry in a distribution. A right-skewed distribution is one with a long tail of large values, in which the mean sits above the median.

A histogram is a chart in which the range of a quantitative variable is divided into intervals and the height of each bar shows how many observations fall in that interval. A boxplot is a chart that displays the median, the two quartiles and the extent of the data in a single summary.

Chapter 3 Probability

3.1 Basic Ideas

Probability is a number between zero and one that measures how likely an event is to occur. An experiment is any process whose outcome cannot be predicted with certainty in advance. The sample space is the set of all possible outcomes of an experiment. An event is any collection of outcomes from the sample space.

The classical approach assigns each outcome the same probability when the outcomes are equally likely. The relative frequency approach estimates the probability of an event as the proportion of times it occurred in a long series of trials. The law of large numbers states that the relative frequency of an event approaches its true probability as the number of trials grows.

3.2 Combining Events

The complement of an event is the collection of all outcomes in which that event does not occur. The union of two events is the event that at least one of them occurs. The intersection of two events is the event that both of them occur together.

Mutually exclusive events are events that cannot both occur on the same trial. Independent events are events for which the occurrence of one does not change the probability of the other. Two events that are mutually exclusive cannot be independent, because knowing that one has occurred tells us the other did not.

The addition rule states that the probability of the union of two events equals the sum of their probabilities minus the probability of their intersection. The multiplication rule states that the probability that two events both occur equals the probability of the first multiplied by the conditional probability of the second given the first.

3.3 Conditional Probability

Conditional probability is the probability that one event occurs given that another event is known to have occurred. Prior probability is the probability assigned to an event before new evidence is taken into account. Posterior probability is the probability of an event after the evidence has been taken into account.

Bayes theorem is the rule that converts a prior probability into a posterior probability using the likelihood of the observed evidence. The theorem matters in testing because a positive result from an accurate test can still be more likely to be wrong than right when the condition itself is rare.

For example, suppose a disease affects 1 percent of a population and a test detects it correctly 99 percent of the time. Most positive results then come from healthy people, because the healthy group is a hundred times larger than the affected group.

Chapter 4 Random Variables and Distributions

4.1 Random Variables

A random variable is a rule that assigns a number to each outcome of an experiment. A discrete random variable is one that takes a countable list of values. A continuous random variable is one that takes any value in an interval, so probability is attached to ranges rather than to single points.

A probability distribution is a description of the values a random variable can take together with how probability is spread over them. The expected value is the long-run average value of a random variable over many repetitions. The variance of a random variable is the expected value of the squared distance from its expected value.

4.2 Common Distributions

The binomial distribution is the distribution of the number of successes in a fixed number of independent trials that each have the same probability of success. The Poisson distribution is the distribution of the number of events occurring in a fixed interval when events happen independently at a constant average rate.

The normal distribution is a symmetric bell-shaped continuous distribution described completely by its mean and its standard deviation. The standard normal distribution is the normal distribution whose mean is 0 and whose standard deviation is 1. A z-score is the number of standard deviations an observation lies away from the mean.

The empirical rule states that about 68 percent of observations from a normal distribution lie within one standard deviation of the mean, about 95 percent within two, and about 99.7 percent within three.

4.3 Sampling Distributions

A sampling distribution is the distribution of a statistic across all possible samples of a given size from the same population. The standard error is the standard deviation of a sampling distribution, and it measures how much a statistic varies from sample to sample.

The central limit theorem states that the sampling distribution of the sample mean approaches a normal shape as the sample size grows, whatever the shape of the population. This result is why so many procedures assume normality even for populations that are not normal.

Chapter 5 Estimation

5.1 Point and Interval Estimates

A point estimate is a single number computed from a sample and used as a guess for a population parameter. An interval estimate is a range of values computed from a sample and believed to contain the parameter. A confidence interval is an interval estimate together with a stated level of confidence in the method that produced it.

The confidence level is the proportion of intervals that would contain the parameter if the whole sampling procedure were repeated many times. The margin of error is the distance from the centre of a confidence interval to either of its ends.

5.2 What Changes the Width

The width of a confidence interval grows when the confidence level is raised, because a wider net is needed to catch the parameter more often. The width shrinks as the sample size grows, because the standard error falls as the sample size increases. The width also shrinks when the population is less variable, since a smaller standard deviation produces a smaller standard error.

A common misreading is to say that a 95 percent interval has a 95 percent chance of containing the parameter. The parameter is a fixed number, so the confidence belongs to the procedure and not to any single interval it produced.

Chapter 6 Hypothesis Testing

6.1 The Two Hypotheses

The null hypothesis is the statement of no effect or no difference that a test starts by assuming. The alternative hypothesis is the statement the researcher will accept if the evidence against the null hypothesis is strong enough. A test never proves the null hypothesis, because failing to find evidence is not the same as showing there is nothing to find.

The significance level is the probability of rejecting the null hypothesis when it is in fact true, chosen before the data are examined. The p-value is the probability of observing data at least as extreme as the data actually observed, computed under the assumption that the null hypothesis is true.

A type I error is rejecting a null hypothesis that is actually true. A type II error is failing to reject a null hypothesis that is actually false. The power of a test is the probability that it rejects a null hypothesis that is false.

Lowering the significance level reduces the chance of a type I error but raises the chance of a type II error, because the evidence required to reject becomes harder to reach.

6.2 Carrying Out a Test

The steps of a hypothesis test are carried out in a fixed order.
1. State the null hypothesis and the alternative hypothesis in terms of a population parameter.
2. Choose the significance level before looking at the data.
3. Check that the conditions of the test are satisfied by the sample.
4. Compute the test statistic from the sample.
5. Compare the p-value with the significance level and state the conclusion in the language of the problem.

A test statistic is a number computed from the sample that measures how far the data fall from what the null hypothesis predicted. The critical value is the boundary that the test statistic must pass for the null hypothesis to be rejected. Statistical significance is the conclusion that an observed effect is larger than sampling variation alone would comfortably explain.

Statistical significance is not the same as practical importance, because a very large sample can make a tiny and useless difference significant.

Chapter 7 Relationships Between Variables

7.1 Correlation

A scatterplot is a chart that shows the relationship between two quantitative variables by plotting one against the other. Correlation is the strength and direction of a straight-line relationship between two quantitative variables. The correlation coefficient is a number between minus one and one that measures that strength and direction.

A positive correlation is a relationship in which large values of one variable tend to occur with large values of the other. A negative correlation is a relationship in which large values of one variable tend to occur with small values of the other.

Correlation does not establish causation, because a third variable may be driving both of the measured ones. A lurking variable is a variable that affects both of the variables being studied but is not itself included in the analysis.

7.2 Regression

Simple linear regression is the method of fitting a straight line that predicts one quantitative variable from another. The response variable is the variable being predicted. The explanatory variable is the variable used to do the predicting.

A residual is the difference between an observed value and the value the fitted line predicts for it. The least squares line is the line that makes the sum of the squared residuals as small as possible. The coefficient of determination is the proportion of the variation in the response variable that the fitted line accounts for.

Extrapolation is the use of a fitted line to predict outside the range of the data it was fitted to, and it is unreliable because nothing in the data supports the shape of the relationship out there.

Chapter 8 Designing a Study

8.1 Samples

A simple random sample is a sample chosen so that every group of the same size has an equal chance of being selected. A stratified sample is a sample drawn by dividing the population into groups and sampling within each group separately. A cluster sample is a sample drawn by dividing the population into groups and then selecting whole groups at random.

A convenience sample is a sample made up of whichever members were easiest to reach, and it is untrustworthy because the members who are easy to reach usually differ from the ones who are not. Non-response is the failure to obtain data from some of the individuals who were selected for a sample.

8.2 Experiments

An observational study is a study in which the researcher measures individuals without attempting to influence them. An experiment is a study in which the researcher deliberately imposes a treatment in order to observe the response. Randomisation is the assignment of subjects to treatments by chance.

A control group is a group that does not receive the treatment under study and provides a baseline for comparison. A placebo is a dummy treatment with no active ingredient given so that subjects cannot tell which group they are in. Blinding is the practice of keeping subjects or assessors unaware of which treatment each subject received.

Confounding occurs when the effect of the treatment cannot be separated from the effect of another variable. Randomisation protects a study from confounding, because it spreads unknown differences evenly across the treatment groups on average.
`;
