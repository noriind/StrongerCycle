import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useUser } from "../../context/UserContext";
import onboardingService from "../../services/onboardingService";
import styles from "./Onboarding.module.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { user, setUser } = useUser();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      email: user()?.email || user?.email, // Include user email
      firstName: "",
      age: "",
      fitnessLevel: "",
      goals: [],
      cycleLength: 28,
      lastPeriodStart: "",
      averagePeriodLength: 5,
      trackingSymptoms: [],
      preferredWorkoutTypes: [],
      motivationForTracking: "",
      experienceWithCycleTracking: "",
      notifications: {
        cycleReminders: true,
        workoutReminders: true,
      },
    },
  });

  const totalSteps = 4;

  const nextStep = async () => {
    let fieldsToValidate = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["firstName", "age", "fitnessLevel"];
        break;
      case 2:
        fieldsToValidate = [
          "cycleLength",
          "lastPeriodStart",
          "averagePeriodLength",
        ];
        break;
      case 3:
        fieldsToValidate = ["goals"];
        break;
      default:
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async data => {
    setIsLoading(true);
    setError(null);

    try {
      await onboardingService.saveProfile(data);

      setUser({
        ...user,
        hasCompletedOnboarding: true,
        profile: data,
      });

      setSuccessMessage(
        "Profile created successfully! Welcome to StrongCycles!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep register={register} errors={errors} />;
      case 2:
        return <CycleInfoStep register={register} errors={errors} />;
      case 3:
        return (
          <PreferencesStep register={register} errors={errors} watch={watch} />
        );
      default:
        return null;
    }
  };

  if (successMessage) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.successMessage}>
            <h2>🎉 Welcome to StrongCycles!</h2>
            <p>{successMessage}</p>
            <button
              className={styles.primaryButton}
              onClick={() => {
                console.log("Before navigate - user:", user); // Add this
                navigate("/");
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <h1 className={styles.title}>Let's Set Up Your Profile</h1>
        <p className={styles.subtitle}>
          Step {currentStep} of {totalSteps}
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}

          <div className={styles.buttonGroup}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className={styles.secondaryButton}
              >
                Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className={styles.primaryButton}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {isLoading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Step Components
function PersonalInfoStep({ register, errors }) {
  return (
    <div className={styles.stepContent}>
      <h2>Personal Information</h2>

      <div className={styles.inputGroup}>
        <label>First Name</label>
        <input
          {...register("firstName", { required: "First name is required" })}
          className={styles.input}
        />
        {errors.firstName && (
          <span className={styles.error}>{errors.firstName.message}</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>Age</label>
        <input
          type="number"
          {...register("age", {
            required: "Age is required",
            min: { value: 13, message: "Must be at least 13 years old" },
            max: { value: 65, message: "Must be under 65 years old" },
          })}
          className={styles.input}
        />
        {errors.age && (
          <span className={styles.error}>{errors.age.message}</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>Fitness Level</label>
        <select
          {...register("fitnessLevel", {
            required: "Please select your fitness level",
          })}
          className={styles.select}
        >
          <option value="">Choose your level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {errors.fitnessLevel && (
          <span className={styles.error}>{errors.fitnessLevel.message}</span>
        )}
      </div>
    </div>
  );
}

function CycleInfoStep({ register, errors }) {
  return (
    <div className={styles.stepContent}>
      <h2>Cycle Information</h2>

      <div className={styles.inputGroup}>
        <label>Average Cycle Length (days)</label>
        <input
          type="number"
          {...register("cycleLength", {
            required: "Cycle length is required",
            min: { value: 21, message: "Minimum 21 days" },
            max: { value: 35, message: "Maximum 35 days" },
          })}
          className={styles.input}
        />
        {errors.cycleLength && (
          <span className={styles.error}>{errors.cycleLength.message}</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>Last Period Start Date</label>
        <input
          type="date"
          {...register("lastPeriodStart", {
            required: "Please enter your last period start date",
          })}
          className={styles.input}
        />
        {errors.lastPeriodStart && (
          <span className={styles.error}>{errors.lastPeriodStart.message}</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>Average Period Length (days)</label>
        <input
          type="number"
          {...register("averagePeriodLength", {
            min: { value: 3, message: "Minimum 3 days" },
            max: { value: 8, message: "Maximum 8 days" },
          })}
          className={styles.input}
        />
        {errors.averagePeriodLength && (
          <span className={styles.error}>
            {errors.averagePeriodLength.message}
          </span>
        )}
      </div>
    </div>
  );
}

function PreferencesStep({ register, errors, watch }) {
  const goals = [
    "strength",
    "endurance",
    "weight-loss",
    "general-fitness",
    "muscle-gain",
  ];
  const workoutTypes = [
    "strength-training",
    "cardio",
    "yoga",
    "pilates",
    "swimming",
    "running",
  ];

  return (
    <div className={styles.stepContent}>
      <h2>Your Preferences</h2>

      <div className={styles.inputGroup}>
        <label>Your Goals (select all that apply)</label>
        <div className={styles.checkboxGroup}>
          {goals.map(goal => (
            <label key={goal} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={goal}
                {...register("goals", {
                  required: "Please select at least one goal",
                })}
              />
              {goal.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </label>
          ))}
        </div>
        {errors.goals && (
          <span className={styles.error}>{errors.goals.message}</span>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>Preferred Workout Types</label>
        <div className={styles.checkboxGroup}>
          {workoutTypes.map(type => (
            <label key={type} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={type}
                {...register("preferredWorkoutTypes")}
              />
              {type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
